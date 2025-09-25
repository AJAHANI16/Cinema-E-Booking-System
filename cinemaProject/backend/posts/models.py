# posts/models.py
from django.db import models

class Movie(models.Model):
    STATUS_CHOICES = [
        ("running", "Currently Running"),
        ("coming_soon", "Coming Soon"),
    ]

    title = models.CharField(max_length=200)
    rating = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    poster_url = models.URLField(blank=True, null=True)  # <-- frontend expects poster_url
    trailer_youtube_id = models.CharField(max_length=50, blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="running")
    release_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title