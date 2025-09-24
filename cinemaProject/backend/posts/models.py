from django.db import models


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Movie(models.Model):
    STATUS_CHOICES = [
        ('RUNNING', 'Currently Running'),
        ('COMING_SOON', 'Coming Soon'),
    ]

    title = models.CharField(max_length=200)
    rating = models.CharField(max_length=10)
    description = models.TextField()
    poster_url = models.URLField()
    trailer_url = models.URLField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    genre = models.ManyToManyField(Genre)

    def __str__(self):
        return self.title
