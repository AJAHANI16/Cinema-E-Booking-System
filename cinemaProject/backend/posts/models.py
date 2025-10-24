from django.db import models
from django.db.models.fields import PositiveIntegerField
from django.core.validators import MinValueValidator, RegexValidator
from rest_framework import settings


# Create your models here.
class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    rating = models.CharField(max_length=10)
    duration = models.IntegerField()
    release_date = models.DateField(null = True, blank = True)
    trailer_url = models.URLField(blank = True)
    movie_poster_URL = models.URLField(blank = True)
    genre = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class MovieRoom(models.Model):
    name = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveIntegerField()

    def __str__(self):
        return self.name


class Seats(models.Model):
    movieRoom = models.ForeignKey(MovieRoom, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=1)
    number = models.IntegerField()

    class Meta:
        seat_number = (("movieRoom", "row", "number"),)

    def __str__(self):
        return f"{self.movieRoom.name} - {self.row}{self.number}"


class Showtime(models.Model):
    class Format(models.TextChoices):
        TWO_D = "2D", "2D"
        THREE_D = "3D", "3D"
        IMAX = "IMAX", "IMAX"
        DOLBY = "DOLBY", "Dolby Cinema"

    class PriceTier(models.TextChoices):
        STANDARD = "STANDARD", "Standard"
        HANDICAP = "HANDICAP", "Handicap"
        SENIOR = "SENIOR", "Senior"

    movie = models.ForeignKey(Movie, on_delete=models.PROTECT, related_name="showtimes")
    movieRoom = models.ForeignKey(MovieRoom, on_delete=models.PROTECT, related_name="showtimes")
    starts_at = models.DateTimeField()
    format = models.CharField(max_length=10, choices=Format.choices, default=Format.TWO_D)
    price_tier = models.CharField(max_length=10, choices=PriceTier.choices, default=PriceTier.STANDARD)
    base_price = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(0)])

    class Meta:
        indexes = [models.Index(fields=["starts_at"])]
        unique_together = (("movieRoom", "starts_at"),)

    def __str__(self):
        return f"{self.movie.title} @ {self.starts_at:%Y-%m-%d %H:%M} ({self.movieRoom.name})"


class Customer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    loyalty_id = models.CharField(max_length=20, blank=True, unique=True, null=True)

    def __str__(self):
        return self.user.get_username()


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="bookings")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2,
                                       default=0, validators=[MinValueValidator(0)])
    promo_code = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f"Booking #{self.pk} - {self.customer} - {self.status}"


class Ticket(models.Model):
    class TicketType(models.TextChoices):
        ADULT = "ADULT", "Adult"
        STUDENT = "STUDENT", "Student"
        CHILD = "CHILD", "Child"
        SENIOR = "SENIOR", "Senior"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="tickets")
    showtime = models.ForeignKey(Showtime, on_delete=models.PROTECT, related_name="tickets")
    seat = models.ForeignKey(Seats, on_delete=models.PROTECT, related_name="tickets")
    price = models.DecimalField(max_digits=7, decimal_places=2,
                                validators=[MinValueValidator(0)])
    ticket_type = models.CharField(max_length=10, choices=TicketType.choices, default=TicketType.ADULT)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["showtime", "seat"], name="unique_seat_per_showtime"),
        ]

    def __str__(self):
        return f"{self.showtime} - {self.seat} ({self.ticket_type})"