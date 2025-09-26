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
        # ==== RUNNING NOW (10) ====
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
            "title": "The Dark Knight",
            "rating": "PG-13",
            "description": "Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            "trailer_youtube_id": "EXeTwQWrcwY",
            "genre": "Action",
            "status": "running",
            "release_date": date(2008, 7, 18),
        },
        {
            "title": "Avatar: The Way of Water",
            "rating": "PG-13",
            "description": "Jake Sully lives with his family on Pandora and faces a renewed threat from humans.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
            "trailer_youtube_id": "d9MyW72ELq0",
            "genre": "Sci-Fi",
            "status": "running",
            "release_date": date(2022, 12, 16),
        },
        {
            "title": "Oppenheimer",
            "rating": "R",
            "description": "The story of American scientist J. Robert Oppenheimer and his role in the Manhattan Project.",
            "poster_url": "https://image.tmdb.org/t/p/w1280/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            "trailer_youtube_id": "uYPbbksJxIg",
            "genre": "Drama",
            "status": "running",
            "release_date": date(2023, 7, 21),
        },
        {
            "title": "Barbie",
            "rating": "PG-13",
            "description": "Barbie and Ken embark on a journey of self-discovery after leaving Barbieland.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
            "trailer_youtube_id": "pBk4NYhWNMM",
            "genre": "Comedy",
            "status": "running",
            "release_date": date(2023, 7, 21),
        },
        {
            "title": "Spider-Man: No Way Home",
            "rating": "PG-13",
            "description": "Spider-Man seeks help from Doctor Strange after his identity is revealed.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
            "trailer_youtube_id": "JfVOs4VSpmA",
            "genre": "Action",
            "status": "running",
            "release_date": date(2021, 12, 17),
        },
        {
            "title": "Guardians of the Galaxy Vol. 3",
            "rating": "PG-13",
            "description": "The Guardians face new challenges while protecting Rocket from his past.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
            "trailer_youtube_id": "u3V5KDHRQvk",
            "genre": "Sci-Fi",
            "status": "running",
            "release_date": date(2023, 5, 5),
        },
        {
            "title": "Black Panther: Wakanda Forever",
            "rating": "PG-13",
            "description": "The Wakandans fight to protect their nation from intervening world powers.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
            "trailer_youtube_id": "RlOB3UALvrQ",
            "genre": "Action",
            "status": "running",
            "release_date": date(2022, 11, 11),
        },
        {
            "title": "Top Gun: Maverick",
            "rating": "PG-13",
            "description": "After 30 years, Maverick returns as a top Navy aviator, training the next generation.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
            "trailer_youtube_id": "giXco2jaZ_4",
            "genre": "Action",
            "status": "running",
            "release_date": date(2022, 5, 27),
        },

        # ==== COMING SOON (10) ====
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
        {
            "title": "Deadpool & Wolverine",
            "rating": "R",
            "description": "Deadpool teams up with Wolverine in a multiverse adventure.",
            "poster_url": "https://image.tmdb.org/t/p/w1280/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
            "trailer_youtube_id": "Yjov-Q5EpDE",
            "genre": "Action",
            "status": "coming_soon",
            "release_date": date(2024, 7, 26),
        },
        {
            "title": "Joker: Folie à Deux",
            "rating": "R",
            "description": "Arthur Fleck returns as Joker, with a darkly musical twist.",
            "poster_url": "https://image.tmdb.org/t/p/w1280/if8QiqCI7WAGImKcJCfzp6VTyKA.jpg",
            "trailer_youtube_id": "CX3z_Vu5q4k",
            "genre": "Drama",
            "status": "coming_soon",
            "release_date": date(2024, 10, 4),
        },
        {
            "title": "Inside Out 2",
            "rating": "PG",
            "description": "Riley navigates her teenage years with new emotions joining the mix.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/8riWcADI1ekEiBguVB9vkilhiQm.jpg",
            "trailer_youtube_id": "LEjhY15eCx0",
            "genre": "Animation",
            "status": "coming_soon",
            "release_date": date(2024, 6, 14),
        },
        {
            "title": "Mission: Impossible – Dead Reckoning Part Two",
            "rating": "PG-13",
            "description": "Ethan Hunt returns for another impossible mission.",
            "poster_url": "https://image.tmdb.org/t/p/w1280/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
            "trailer_youtube_id": "avz06PDqDbM",
            "genre": "Action",
            "status": "coming_soon",
            "release_date": date(2025, 5, 23),
        },
        {
            "title": "The Batman Part II",
            "rating": "PG-13",
            "description": "Robert Pattinson returns as Batman in the sequel to the 2022 hit.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/74xTEgt7R36Fpooo50r9T25onhq.jpg",
            "trailer_youtube_id": "mqqft2x_Aa4",
            "genre": "Action",
            "status": "coming_soon",
            "release_date": date(2025, 10, 2),
        },
        {
            "title": "Frozen III",
            "rating": "PG",
            "description": "Anna, Elsa, and friends return for another magical adventure.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/mINJaa34MtknCYl5AjtNJzWj8cD.jpg",
            "trailer_youtube_id": "TbQm5doF_Uc",
            "genre": "Animation",
            "status": "coming_soon",
            "release_date": date(2025, 11, 26),
        },
        {
            "title": "Avengers: Secret Wars",
            "rating": "PG-13",
            "description": "Earth’s mightiest heroes unite to face a multiversal threat.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/r7XifzvtezNt31ypvsmb6Oqxw49.jpg",
            "trailer_youtube_id": "Z3h0-KYkBfY",
            "genre": "Action",
            "status": "coming_soon",
            "release_date": date(2027, 5, 7),
        },
        {
            "title": "Toy Story 5",
            "rating": "G",
            "description": "Woody, Buzz, and friends embark on a new adventure.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
            "trailer_youtube_id": "JcpWXaA2qeg",
            "genre": "Animation",
            "status": "coming_soon",
            "release_date": date(2026, 6, 19),
        },
        {
            "title": "Shrek 5",
            "rating": "PG",
            "description": "Shrek, Donkey, and Fiona return in a new chapter of the beloved franchise.",
            "poster_url": "https://www.themoviedb.org/t/p/w1280/2yYP0PQjG8zVqturh1BAqu2Tixl.jpg",
            "trailer_youtube_id": "CwXOrWvPBPk",
            "genre": "Comedy",
            "status": "coming_soon",
            "release_date": date(2026, 12, 18),
        },
    ]

    for movie_data in movies:
        movie, created = Movie.objects.get_or_create(
            title=movie_data["title"],
            defaults=movie_data
        )
        if created:
            print(f"✅ Added {movie.title}")
        else:
            print(f"⚠️ {movie.title} already exists")

if __name__ == "__main__":
    run()