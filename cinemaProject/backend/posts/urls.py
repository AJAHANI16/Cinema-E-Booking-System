# posts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MovieViewSet,
    register_user,
    login_user,
    logout_user,
    user_profile,
    check_auth_status,
    verify_email,
    resend_verification,
    request_password_reset,
    reset_password,
    change_password,
    payment_cards,
    payment_card_detail,
    MovieAdminViewSet,
    PromotionAdminViewSet,
    ShowroomAdminViewSet,
    ShowtimeAdminViewSet,
    UserAdminViewSet,
    MovieRoomAdminViewSet,
    ShowtimeViewSet,
    BookingViewSet,
)

router = DefaultRouter()
router.register(r"movies", MovieViewSet, basename="movie")
router.register(r"showtimes", ShowtimeViewSet, basename="showtime")
router.register(r"bookings", BookingViewSet, basename="booking")
router.register(r"admin/movies", MovieAdminViewSet, basename="admin-movie")
router.register(r"admin/promotions", PromotionAdminViewSet, basename="admin-promotion")
router.register(r"admin/showrooms", ShowroomAdminViewSet, basename="admin-showroom")
router.register(r"admin/showtimes", ShowtimeAdminViewSet, basename="admin-showtime")
router.register(r"admin/movie-rooms", MovieRoomAdminViewSet, basename="admin-movie-room")
router.register(r"admin/users", UserAdminViewSet, basename="admin-user")

urlpatterns = [
    path("", include(router.urls)),

    # ---------------------------------------------------------
    # Authentication
    # ---------------------------------------------------------
    path("auth/register/", register_user, name="register"),
    path("auth/login/", login_user, name="login"),
    path("auth/logout/", logout_user, name="logout"),
    path("auth/status/", check_auth_status, name="auth_status"),

    # ---------------------------------------------------------
    # Email verification
    # ---------------------------------------------------------
    path("auth/verify-email/<str:token>/", verify_email, name="verify_email"),
    path("auth/resend-verification/", resend_verification, name="resend_verification"),

    # ---------------------------------------------------------
    # Password reset
    # ---------------------------------------------------------
    path("auth/password-reset/request/", request_password_reset, name="request_password_reset"),
    path("auth/password-reset/<str:token>/", reset_password, name="reset_password"),
    path("auth/change-password/", change_password, name="change_password"),

    # ---------------------------------------------------------
    # Profile management
    # ---------------------------------------------------------
    path("auth/profile/", user_profile, name="profile"),

    # ---------------------------------------------------------
    # Payment cards
    # ---------------------------------------------------------
    path("auth/payment-cards/", payment_cards, name="payment_cards"),
    path("auth/payment-cards/<int:card_id>/", payment_card_detail, name="payment_card_detail"),
]
