from django.shortcuts import render
from rest_framework import viewsets
from .models import Movie
from .serializers import MovieSerializer

# Create your views here.
class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer

    # search function
    def get_queryset(self):
        # order every movie alphabetically
        qs = Movie.objects.all().order_by("title")

        # get the query parameter from url
        q = self.request.query_params.get("q")

        # if there is a query, return only the movies that has a title that contains it
        if q:
            return Movie.objects.filter(title__icontains=q)
        # If no query, return every movie
        return Movie.objects.all()