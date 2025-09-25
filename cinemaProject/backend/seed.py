# backend/seed.py
import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from posts.models import Movie

def run():
    Movie.objects.all().delete()  # ⚠️ deletes everything!
    print("🗑️ Cleared old movies")
    movies = [
        {
            "title": "Inception",
            "rating": "PG-13",
            "description": "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
            "trailer_youtube_id": "8hP9D6kZseM",
            "genre": "Sci-Fi",
            "status": "running",
            "release_date": date(2010, 7, 16),
        },
        {
            "title": "Interstellar",
            "rating": "PG-13",
            "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            "trailer_youtube_id": "zSWdZVtXT7E",
            "genre": "Adventure",
            "status": "running",
            "release_date": date(2014, 11, 7),
        },
        {
            "title": "Dune: Part Two",
            "rating": "PG-13",
            "description": "Paul Atreides unites with the Fremen while seeking revenge against the conspirators who destroyed his family.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
            "trailer_youtube_id": "U2Qp5pL3ovA",
            "genre": "Sci-Fi",
            "status": "coming_soon",
            "release_date": date(2024, 3, 1),
        },
    ]

    for movie_data in movies:
        movie, created = Movie.objects.get_or_create(title=movie_data["title"], defaults=movie_data)
        if created:
            print(f"✅ Added {movie.title}")
        else:
            print(f"⚠️ {movie.title} already exists")

if __name__ == "__main__":
    run()