# posts/serializers.py
from rest_framework import serializers
from .models import Movie

class MovieSerializer(serializers.ModelSerializer):
    # Provide hardcoded showtimes for Sprint 1 (API returns a small array)
    showtimes = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        # use explicit fields so we know what's coming to the frontend
        fields = [
            "id",
            "title",
            "rating",
            "description",
            "poster_url",
            "trailer_youtube_id",
            "genre",
            "status",
            "release_date",
            "showtimes",
        ]

    def get_showtimes(self, obj):
        # Sprint requirement: hardcoded showtimes (demo values)
        return ["2:00 PM", "5:00 PM", "8:00 PM"]