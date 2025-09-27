# backend/seed.py
import os
import django
from datetime import date
from django.utils.text import slugify

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from posts.models import Movie


def run():
    Movie.objects.all().delete()
    print("🗑️ Cleared old movies")

    movies = [
        # ==== RUNNING NOW (10) ====
        {
            "title": "Inception",
            "rating": "PG-13",
            "description": "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
            "trailer_id": "8hP9D6kZseM",
            "genre": "Sci-Fi",
            "duration": 148,
            "release_date": date(2010, 7, 16),
            "category": "currently-running",
        },
        {
            "title": "Interstellar",
            "rating": "PG-13",
            "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            "trailer_id": "zSWdZVtXT7E",
            "genre": "Adventure",
            "duration": 169,
            "release_date": date(2014, 11, 7),
            "category": "currently-running",
        },
        {
            "title": "The Dark Knight",
            "rating": "PG-13",
            "description": "Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            "trailer_id": "EXeTwQWrcwY",
            "genre": "Action",
            "duration": 152,
            "release_date": date(2008, 7, 18),
            "category": "currently-running",
        },
        {
            "title": "Avatar: The Way of Water",
            "rating": "PG-13",
            "description": "Jake Sully lives with his family on Pandora and faces a renewed threat from humans.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
            "trailer_id": "d9MyW72ELq0",
            "genre": "Sci-Fi",
            "duration": 192,
            "release_date": date(2022, 12, 16),
            "category": "currently-running",
        },
        {
            "title": "Oppenheimer",
            "rating": "R",
            "description": "The story of American scientist J. Robert Oppenheimer and his role in the Manhattan Project.",
            "movie_poster_URL": "https://image.tmdb.org/t/p/w1280/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            "trailer_id": "uYPbbksJxIg",
            "genre": "Drama",
            "duration": 180,
            "release_date": date(2023, 7, 21),
            "category": "currently-running",
        },
        {
            "title": "Barbie",
            "rating": "PG-13",
            "description": "Barbie and Ken embark on a journey of self-discovery after leaving Barbieland.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
            "trailer_id": "pBk4NYhWNMM",
            "genre": "Comedy",
            "duration": 114,
            "release_date": date(2023, 7, 21),
            "category": "currently-running",
        },
        {
            "title": "Spider-Man: No Way Home",
            "rating": "PG-13",
            "description": "Spider-Man seeks help from Doctor Strange after his identity is revealed.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
            "trailer_id": "JfVOs4VSpmA",
            "genre": "Action",
            "duration": 148,
            "release_date": date(2021, 12, 17),
            "category": "currently-running",
        },
        {
            "title": "Guardians of the Galaxy Vol. 3",
            "rating": "PG-13",
            "description": "The Guardians face new challenges while protecting Rocket from his past.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
            "trailer_id": "u3V5KDHRQvk",
            "genre": "Sci-Fi",
            "duration": 150,
            "release_date": date(2023, 5, 5),
            "category": "currently-running",
        },
        {
            "title": "Black Panther: Wakanda Forever",
            "rating": "PG-13",
            "description": "The Wakandans fight to protect their nation from intervening world powers.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
            "trailer_id": "RlOB3UALvrQ",
            "genre": "Action",
            "duration": 161,
            "release_date": date(2022, 11, 11),
            "category": "currently-running",
        },
        {
            "title": "Top Gun: Maverick",
            "rating": "PG-13",
            "description": "After 30 years, Maverick returns as a top Navy aviator, training the next generation.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
            "trailer_id": "giXco2jaZ_4",
            "genre": "Action",
            "duration": 131,
            "release_date": date(2022, 5, 27),
            "category": "currently-running",
        },

        # ==== COMING SOON (10) ====
        {
            "title": "Dune: Part Two",
            "rating": "PG-13",
            "description": "Paul Atreides unites with the Fremen while seeking revenge against the conspirators who destroyed his family.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
            "trailer_id": "U2Qp5pL3ovA",
            "genre": "Sci-Fi",
            "duration": 155,
            "release_date": date(2024, 3, 1),
            "category": "coming-soon",
        },
        {
            "title": "Deadpool & Wolverine",
            "rating": "R",
            "description": "Deadpool teams up with Wolverine in a multiverse adventure.",
            "movie_poster_URL": "https://image.tmdb.org/t/p/w1280/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
            "trailer_id": "73_1biulkYk",
            "genre": "Action",
            "duration": 120,
            "release_date": date(2024, 7, 26),
            "category": "coming-soon",
        },
        {
            "title": "Joker: Folie à Deux",
            "rating": "R",
            "description": "Arthur Fleck returns as Joker, with a darkly musical twist.",
            "movie_poster_URL": "https://image.tmdb.org/t/p/w1280/if8QiqCI7WAGImKcJCfzp6VTyKA.jpg",
            "trailer_id": "_OKAwz2MsJs",
            "genre": "Drama",
            "duration": 120,
            "release_date": date(2024, 10, 4),
            "category": "coming-soon",
        },
        {
            "title": "Inside Out 2",
            "rating": "PG",
            "description": "Riley navigates her teenage years with new emotions joining the mix.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/8riWcADI1ekEiBguVB9vkilhiQm.jpg",
            "trailer_id": "LEjhY15eCx0",
            "genre": "Animation",
            "duration": 120,
            "release_date": date(2024, 6, 14),
            "category": "coming-soon",
        },
        {
            "title": "Mission: Impossible – Dead Reckoning Part Two",
            "rating": "PG-13",
            "description": "Ethan Hunt returns for another impossible mission.",
            "movie_poster_URL": "https://image.tmdb.org/t/p/w1280/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
            "trailer_id": "avz06PDqDbM",
            "genre": "Action",
            "duration": 145,
            "release_date": date(2025, 5, 23),
            "category": "coming-soon",
        },
        {
            "title": "Superman (2025)",
            "rating": "PG-13",
            "description": "A new incarnation of Superman seeks to restore hope in a world torn by chaos.",
            "movie_poster_URL": "https://image.tmdb.org/t/p/w1280/wPLysNDLffQLOVebZQCbXJEv6E6.jpg",
            "trailer_id": "Ox8ZLF6cGM0",
            "genre": "Action",
            "duration": 140,
            "release_date": date(2025, 7, 4),
            "category": "coming-soon",
        },
        {
            "title": "The Matrix",
            "rating": "R",
            "description": "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
            "trailer_id": "vKQi3bBA1y8",
            "genre": "Sci-Fi",
            "duration": 136,
            "release_date": date(1999, 3, 31),
            "category": "currently-running",
        },
        {
            "title": "The Lord of the Rings: The Fellowship of the Ring",
            "rating": "PG-13",
            "description": "A meek Hobbit and eight companions set out on a journey to destroy the powerful One Ring.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
            "trailer_id": "V75dMMIW2B4",
            "genre": "Fantasy",
            "duration": 178,
            "release_date": date(2001, 12, 19),
            "category": "currently-running",
        },
        {
            "title": "The Lion King",
            "rating": "G",
            "description": "A young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
            "trailer_id": "4sj1MT05lAA",
            "genre": "Animation",
            "duration": 88,
            "release_date": date(1994, 6, 24),
            "category": "coming-soon",
        },
        {
            "title": "Titanic",
            "rating": "PG-13",
            "description": "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
            "movie_poster_URL": "https://www.themoviedb.org/t/p/w1280/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
            "trailer_id": "2e-eXJ6HgkQ",
            "genre": "Drama",
            "duration": 195,
            "release_date": date(1997, 12, 19),
            "category": "coming-soon",
        },
    ]

    for m in movies:
        base_slug = slugify(m["title"])
        slug = base_slug
        counter = 1
        while Movie.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        movie = Movie.objects.create(**m, slug=slug)
        print(f"✅ Added {movie.title} ({movie.slug})")


if __name__ == "__main__":
    run()