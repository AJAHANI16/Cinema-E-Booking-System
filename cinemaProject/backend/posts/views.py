from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.db import transaction
from .models import Movie, UserProfile, PaymentCard
from .serializers import (
    MovieSerializer, UserRegistrationSerializer, UserSerializer,
    PaymentCardSerializer, ProfileUpdateSerializer, PasswordChangeSerializer
)
from .email_utils import (
    send_verification_email, send_password_reset_email,
    send_profile_change_notification, send_welcome_email
)


# ---------------------------------------------------------
# Movie View
# ---------------------------------------------------------
class MovieViewSet(viewsets.ModelViewSet):
    """Public API for browsing movies"""
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    lookup_field = "slug"


# ---------------------------------------------------------
# Authentication Views
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            user = serializer.save()
            token = user.profile.generate_verification_token()
            send_verification_email(user, token)

        return Response(
            {
                "message": "Registration successful! Please check your email to verify your account.",
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        print(f"Registration exception: {e}")
        return Response(
            {"error": "An unexpected error occurred during registration."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """Authenticate user with username or email"""
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    remember_me = request.data.get("remember_me", False)

    # Allow login with email or username
    if email and not username:
        try:
            user = User.objects.get(email=email)
            username = user.username
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure profile exists
    profile, _ = UserProfile.objects.get_or_create(user=user)

    # Account verification checks
    if not user.is_active:
        return Response(
            {"error": "Account is not activated. Please check your email to verify your account."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not profile.is_verified:
        return Response(
            {"error": "Email not verified. Please check your inbox for the verification link."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Log in user and set session expiration
    login(request, user)
    request.session.set_expiry(2592000 if remember_me else 0)

    return Response(
        {"message": "Login successful", "user": UserSerializer(user).data},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Log out the current user"""
    logout(request)
    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# Profile Views
# ---------------------------------------------------------
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Retrieve or update the authenticated user's profile"""
    if request.method == "GET":
        cards = PaymentCard.objects.filter(user=request.user)
        return Response(
            {
                "user": UserSerializer(request.user).data,
                "payment_cards": PaymentCardSerializer(cards, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        try:
            send_profile_change_notification(request.user)
        except Exception as e:
            print(f"Failed to send profile change notification: {e}")

        return Response(
            {"message": "Profile updated successfully", "user": UserSerializer(request.user).data},
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def check_auth_status(request):
    """Check whether the user is authenticated"""
    if request.user.is_authenticated:
        return Response(
            {"isAuthenticated": True, "user": UserSerializer(request.user).data},
            status=status.HTTP_200_OK,
        )
    return Response({"isAuthenticated": False}, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# Email Verification
# ---------------------------------------------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def verify_email(request, token):
    """Verify user's email using the provided token"""
    try:
        profile = UserProfile.objects.get(verification_token=token)
    except UserProfile.DoesNotExist:
        return Response({"error": "Invalid verification token"}, status=status.HTTP_400_BAD_REQUEST)

    if not profile.is_verification_token_valid():
        return Response(
            {"error": "Verification link has expired. Please request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = profile.user
    user.is_active = True
    user.save()

    profile.is_verified = True
    profile.verification_token = None
    profile.verification_token_created = None
    profile.save()

    try:
        send_welcome_email(user)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

    return Response({"message": "Email verified successfully! You can now log in."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_verification(request):
    """Resend email verification"""
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "No account found with this email"}, status=status.HTTP_404_NOT_FOUND)

    if user.is_active and user.profile.is_verified:
        return Response({"error": "This account is already verified"}, status=status.HTTP_400_BAD_REQUEST)

    token = user.profile.generate_verification_token()
    send_verification_email(user, token)

    return Response(
        {"message": "Verification email sent. Please check your inbox."},
        status=status.HTTP_200_OK,
    )


# ---------------------------------------------------------
# Password Reset and Change
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Send password reset link to user"""
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Do not reveal that the email does not exist
        return Response(
            {"message": "If an account exists with this email, you will receive a password reset link."},
            status=status.HTTP_200_OK,
        )

    token = user.profile.generate_reset_token()
    send_password_reset_email(user, token)

    return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request, token):
    """Reset password using a valid token"""
    new_password = request.data.get("new_password")
    new_password_confirm = request.data.get("new_password_confirm")

    if not new_password or not new_password_confirm:
        return Response({"error": "Both password fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != new_password_confirm:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = UserProfile.objects.get(reset_token=token)
    except UserProfile.DoesNotExist:
        return Response({"error": "Invalid reset token"}, status=status.HTTP_400_BAD_REQUEST)

    if not profile.is_reset_token_valid():
        return Response(
            {"error": "Reset link has expired. Please request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = profile.user
    user.set_password(new_password)
    user.save()

    profile.reset_token = None
    profile.reset_token_created = None
    profile.save()

    return Response(
        {"message": "Password reset successfully. You can now log in with your new password."},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Allow authenticated users to change their password"""
    serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    update_session_auth_hash(request, request.user)

    try:
        send_profile_change_notification(request.user)
    except Exception as e:
        print(f"Failed to send password change notification: {e}")

    return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# Payment Card Views
# ---------------------------------------------------------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def payment_cards(request):
    """List or create payment cards"""
    if request.method == "GET":
        cards = PaymentCard.objects.filter(user=request.user)
        return Response(PaymentCardSerializer(cards, many=True).data, status=status.HTTP_200_OK)

    existing_count = PaymentCard.objects.filter(user=request.user).count()
    if existing_count >= 4:
        return Response({"error": "You cannot add more than 4 payment cards"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = PaymentCardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(
            {"message": "Payment card added successfully", "card": serializer.data},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def payment_card_detail(request, card_id):
    """Update or delete a specific payment card"""
    try:
        card = PaymentCard.objects.get(id=card_id, user=request.user)
    except PaymentCard.DoesNotExist:
        return Response({"error": "Payment card not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = PaymentCardSerializer(card, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Payment card updated successfully", "card": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    card.delete()
    return Response({"message": "Payment card deleted successfully"}, status=status.HTTP_200_OK)