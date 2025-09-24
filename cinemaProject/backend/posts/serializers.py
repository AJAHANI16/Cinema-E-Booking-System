from rest_framework import serializers
from .models import Movie, Genre

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]

class MovieSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True)
    showtimes = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ["id", "title", "rating", "description", "poster_url", "trailer_url", "status", "genres", "showtimes"]

    def get_showtimes(self, obj):
        return ["2:00 PM", "5:00 PM", "8:00 PM"]  # Hardcoded for Sprint 1