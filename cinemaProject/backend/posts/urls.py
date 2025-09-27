# posts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet   # use relative import for clarity

router = DefaultRouter()
router.register(r"movies", MovieViewSet, basename="movie")  # 👈 basename is good practice

urlpatterns = [
    path("", include(router.urls)),
]