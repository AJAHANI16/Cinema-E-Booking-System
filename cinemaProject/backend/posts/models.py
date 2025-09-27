from django.db import models
from django.utils.text import slugify

class Movie(models.Model):
    CATEGORY_CHOICES = [
        ("currently-running", "Currently Running"),
        ("coming-soon", "Coming Soon"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    rating = models.CharField(max_length=10)
    duration = models.IntegerField()
    release_date = models.DateField(null=True, blank=True)
    trailer_id = models.CharField(max_length=20, blank=True)  # ✅ YouTube video ID only
    movie_poster_URL = models.URLField(blank=True)
    genre = models.CharField(max_length=50)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="currently-running",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title