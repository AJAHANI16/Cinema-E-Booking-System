# posts/serializers.py
from rest_framework import serializers
from .models import Movie

class MovieSerializer(serializers.ModelSerializer):
    # Rename fields to camelCase for frontend
    poster = serializers.URLField(source="movie_poster_URL", read_only=True)
    trailerId = serializers.CharField(source="trailer_id", read_only=True)  # 👈 updated
    releaseDate = serializers.DateField(source="release_date", read_only=True)
    duration = serializers.IntegerField(read_only=True)
    category = serializers.CharField(default="currently-running")
    showtimes = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "rating",
            "poster",
            "genre",
            "category",
            "showtimes",
            "trailerId",
            "releaseDate",
            "duration",
        ]

    def get_showtimes(self, obj):
        # Always return a list (fallback hardcoded for now)
        return ["2:00 PM", "5:00 PM", "8:00 PM"]