# posts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MovieViewSet, 
    register_user, 
    login_user, 
    logout_user, 
    user_profile, 
    check_auth_status
)

router = DefaultRouter()
router.register(r"movies", MovieViewSet, basename="movie")

urlpatterns = [
    path("", include(router.urls)),
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/logout/', logout_user, name='logout'),
    path('auth/profile/', user_profile, name='profile'),
    path('auth/status/', check_auth_status, name='auth_status'),
]
