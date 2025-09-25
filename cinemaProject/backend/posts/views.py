# posts/views.py
from rest_framework import generics, filters
from .models import Movie
from .serializers import MovieSerializer
from django_filters.rest_framework import DjangoFilterBackend

class MovieListAPIView(generics.ListAPIView):
    queryset = Movie.objects.all().order_by('title')
    serializer_class = MovieSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title']
    filterset_fields = ['genre', 'status']

class MovieDetailAPIView(generics.RetrieveAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer