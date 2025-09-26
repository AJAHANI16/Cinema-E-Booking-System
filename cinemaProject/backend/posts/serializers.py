from rest_framework import serializers
from .models import Movie

class MovieSerializer(serializers.ModelSerializer):
    poster = serializers.URLField(source='movie_poster_URL')  
    category = serializers.CharField(default='currently-running')  
    showtimes = serializers.ListField(
        child=serializers.CharField(),
        default=["2:00 PM", "5:00 PM", "8:00 PM"]
    )
    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'description',
            'rating',
            'poster',    
            'genre',
            'category',  
            'showtimes', 
        ]