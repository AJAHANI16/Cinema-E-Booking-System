from rest_framework import viewsets
from .models import Movie
from .serializers import MovieSerializer

# Handles CRUD operations for Movie model
class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    lookup_field = "slug"