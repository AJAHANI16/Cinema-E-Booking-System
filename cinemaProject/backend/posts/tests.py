from datetime import timedelta

from django.test import TestCase, override_settings
from django.utils import timezone
from django.contrib.auth.models import User
from django.core import mail
from rest_framework.test import APIClient

from .models import Movie, MovieRoom, Promotion, Showtime, Showroom, UserProfile


class AdminPortalIntegrationTests(TestCase):
	"""Lightweight integration tests that exercise key admin workflows."""

	def setUp(self):
		self.admin_username = "admin"
		self.admin_password = "password123"
		self.admin_user = User.objects.create_superuser(
			username=self.admin_username,
			password=self.admin_password,
			email="admin@example.com",
		)
		self.client = APIClient()
		self.assertTrue(self.client.login(username=self.admin_username, password=self.admin_password))

		# Shared baseline data for showtime tests
		self.movie = Movie.objects.create(
			title="Test Movie",
			description="An integration test film",
			rating="PG-13",
			duration=120,
			release_date=timezone.now().date(),
			movie_poster_URL="https://example.com/poster.jpg",
			trailer_id="abcdef",
			genre="Drama",
			category="currently-running",
		)

		self.showroom = Showroom.objects.create(
			name="Main Auditorium",
			capacity=200,
			location="First Floor",
		)
		self.movie_room = MovieRoom.objects.create(name=self.showroom.name, capacity=self.showroom.capacity)

	def test_add_movie_persists_with_required_fields(self):
		payload = {
			"title": "Another Movie",
			"genre": "Action",
			"rating": "PG",
			"description": "Explosive thrills",
			"duration": 110,
			"release_date": str(timezone.now().date()),
			"movie_poster_URL": "https://example.com/new.jpg",
			"trailer_id": "trailer123",
			"category": "currently-running",
		}

		response = self.client.post("/api/admin/movies/", payload, format="json")
		self.assertEqual(response.status_code, 201, response.data)

		created = Movie.objects.get(title="Another Movie")
		self.assertEqual(created.genre, payload["genre"])
		self.assertEqual(created.rating, payload["rating"])
		self.assertEqual(created.duration, payload["duration"])

	def test_add_showtime_and_prevent_conflicts(self):
		starts_at = timezone.now() + timedelta(days=1)
		payload = {
			"movie": self.movie.id,
			"movie_room": self.movie_room.id,
			"starts_at": starts_at.isoformat(),
			"format": "2D",
			"base_price": "12.50",
		}

		first_response = self.client.post("/api/admin/showtimes/", payload, format="json")
		self.assertEqual(first_response.status_code, 201, first_response.data)
		self.assertTrue(
			Showtime.objects.filter(
				movie=self.movie,
				movie_room=self.movie_room,
				starts_at__date=starts_at.date(),
			).exists()
		)

		conflict_response = self.client.post("/api/admin/showtimes/", payload, format="json")
		self.assertEqual(conflict_response.status_code, 400, conflict_response.data)
		self.assertIn("non_field_errors", conflict_response.data)

	def test_movie_room_listing_available_for_admin(self):
		extra_room = MovieRoom.objects.create(name="Dolby Cinema", capacity=180)
		response = self.client.get("/api/admin/movie-rooms/")
		self.assertEqual(response.status_code, 200)
		returned_ids = {room["id"] for room in response.data}
		self.assertSetEqual(returned_ids, {self.movie_room.id, extra_room.id})

	@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
	def test_promotion_creation_and_email_only_to_subscribers(self):
		subscribed_user = User.objects.create_user(username="subscriber", password="pass", email="sub@example.com")
		unsubscribed_user = User.objects.create_user(username="nosub", password="pass", email="nosub@example.com")

		subscribed_profile = subscribed_user.profile
		subscribed_profile.subscribed_to_promotions = True
		subscribed_profile.is_verified = True
		subscribed_profile.save()

		unsubscribed_profile = unsubscribed_user.profile
		unsubscribed_profile.subscribed_to_promotions = False
		unsubscribed_profile.is_verified = True
		unsubscribed_profile.save()

		payload = {
			"promo_code": "WINTER25",
			"description": "Seasonal savings",
			"discount_percent": "25.0",
			"start_date": str((timezone.now() - timedelta(days=1)).date()),
			"end_date": str((timezone.now() + timedelta(days=7)).date()),
		}

		create_response = self.client.post("/api/admin/promotions/", payload, format="json")
		self.assertEqual(create_response.status_code, 201, create_response.data)
		promotion_id = create_response.data["id"]

		mail.outbox.clear()
		send_response = self.client.post(f"/api/admin/promotions/{promotion_id}/send_email/")
		self.assertEqual(send_response.status_code, 200, send_response.data)
		self.assertEqual(len(mail.outbox), 1)
		self.assertIn("WINTER25", mail.outbox[0].subject)
		self.assertEqual(mail.outbox[0].to, ["sub@example.com"])

