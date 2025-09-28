# posts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet   # use relative import for clarity

router = DefaultRouter()
# Resgister MovieViewSet with the router
router.register(r"movies", MovieViewSet, basename="movie")  

#URL patterns for the posts app
urlpatterns = [
    path("", include(router.urls)),
]