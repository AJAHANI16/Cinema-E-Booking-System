from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .email_utils import (
    send_password_reset_email,
    send_profile_change_notification,
    send_promotion_email_to_subscribers,
    send_verification_email,
    send_welcome_email,
)
from .models import (
    Booking,
    Customer,
    Movie,
    MovieRoom,
    PaymentCard,
    Promotion,
    Seat,
    Showtime,
    Showroom,
    Ticket,
    UserProfile,
)
from .serializers import (
    BookingSerializer,
    MovieRoomSerializer,
    MovieSerializer,
    PasswordChangeSerializer,
    PaymentCardSerializer,
    ProfileUpdateSerializer,
    PromotionSerializer,
    SeatSerializer,
    ShowtimeSerializer,
    ShowroomSerializer,
    TicketSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


# ---------------------------------------------------------
# Movie Views (Public)
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
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    remember_me = request.data.get("remember_me", False)

    if email and not username:
        try:
            user = User.objects.get(email=email)
            username = user.username
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    profile, _ = UserProfile.objects.get_or_create(user=user)

    if not user.is_active:
        return Response({"error": "Account is not activated. Please check your email to verify your account."},
                        status=status.HTTP_403_FORBIDDEN)

    if not profile.is_verified:
        return Response({"error": "Email not verified. Please check your inbox for the verification link."},
                        status=status.HTTP_403_FORBIDDEN)

    login(request, user)
    request.session.set_expiry(2592000 if remember_me else 0)

    return Response({"message": "Login successful", "user": UserSerializer(user).data}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def validate_promo_code(request):
    """Validate a promotion code before checkout."""
    code = str(request.data.get("promo_code", "")).strip()
    if not code:
        return Response({"error": "promo_code is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        promo = Promotion.objects.get(promo_code__iexact=code)
    except Promotion.DoesNotExist:
        return Response({"error": "Promo code not found"}, status=status.HTTP_404_NOT_FOUND)

    if not promo.is_active():
        return Response({"error": "Promo code is expired or inactive"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            "promo_code": promo.promo_code,
            "discount_percent": promo.discount_percent,
            "start_date": promo.start_date,
            "end_date": promo.end_date,
            "description": promo.description,
        },
        status=status.HTTP_200_OK,
    )


# ---------------------------------------------------------
# Profile Views
# ---------------------------------------------------------
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_profile(request):
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
    try:
        profile = UserProfile.objects.get(verification_token=token)
    except UserProfile.DoesNotExist:
        return Response({"error": "Invalid verification token"}, status=status.HTTP_400_BAD_REQUEST)

    if not profile.is_verification_token_valid():
        return Response({"error": "Verification link has expired. Please request a new one."},
                        status=status.HTTP_400_BAD_REQUEST)

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
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "No account found with this email"}, status=status.HTTP_404_NOT_FOUND)

    if user.is_active and user.profile.is_verified:
        return Response({"error": "This account is already verified"}, status=status.HTTP_400_BAD_REQUEST)

    token = user.profile.generate_verification_token()
    send_verification_email(user, token)

    return Response({"message": "Verification email sent. Please check your inbox."}, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# Password Reset and Change
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
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
        return Response({"error": "Reset link has expired. Please request a new one."},
                        status=status.HTTP_400_BAD_REQUEST)

    user = profile.user
    user.set_password(new_password)
    user.save()

    profile.reset_token = None
    profile.reset_token_created = None
    profile.save()

    return Response({"message": "Password reset successfully. You can now log in with your new password."},
                    status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
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
    if request.method == "GET":
        cards = PaymentCard.objects.filter(user=request.user)
        return Response(PaymentCardSerializer(cards, many=True).data, status=status.HTTP_200_OK)

    existing_count = PaymentCard.objects.filter(user=request.user).count()
    if existing_count >= 4:
        return Response({"error": "You cannot add more than 4 payment cards"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = PaymentCardSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({"message": "Payment card added successfully", "card": serializer.data},
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def payment_card_detail(request, card_id):
    try:
        card = PaymentCard.objects.get(id=card_id, user=request.user)
    except PaymentCard.DoesNotExist:
        return Response({"error": "Payment card not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = PaymentCardSerializer(card, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Payment card updated successfully", "card": serializer.data},
                            status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    card.delete()
    return Response({"message": "Payment card deleted successfully"}, status=status.HTTP_200_OK)

# ---------------------------------------------------------
# ------------------ Admin Panel Views -------------------
# ---------------------------------------------------------
class MovieAdminViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        movie = self.get_object()
        movie.is_active = True
        movie.save()
        return Response({"status": "Movie activated"})


class PromotionAdminViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["post"])
    def send_email(self, request, pk=None):
        promotion = self.get_object()
        sent_count = send_promotion_email_to_subscribers(promotion)
        return Response({"status": f"Promotion email sent to {sent_count} subscriber(s)"})


class ShowroomAdminViewSet(viewsets.ModelViewSet):
    queryset = Showroom.objects.all()
    serializer_class = ShowroomSerializer
    permission_classes = [IsAdminUser]


class MovieRoomAdminViewSet(viewsets.ModelViewSet):
    queryset = MovieRoom.objects.all()
    serializer_class = MovieRoomSerializer
    permission_classes = [IsAdminUser]


class ShowtimeAdminViewSet(viewsets.ModelViewSet):
    queryset = Showtime.objects.all()
    serializer_class = ShowtimeSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        upcoming_showtimes = Showtime.objects.filter(starts_at__gte=timezone.now())
        serializer = self.get_serializer(upcoming_showtimes, many=True)
        return Response(serializer.data)


class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    # Allow admins to list, retrieve, update, and delete users
    http_method_names = ["get", "patch", "put", "delete"]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response(
                {"detail": "Admins cannot delete their own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

# ---------------------------------------------------------
# Showtime viewset
# ---------------------------------------------------------
class ShowtimeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Showtime.objects.all().select_related("movie", "movie_room")
    serializer_class = ShowtimeSerializer

    @action(detail=True, methods=["get"])
    def seats(self, request, pk=None):
        """
        Returns seat availability for the showtime:
        available, reserved, etc.
        """
        showtime = self.get_object()
        seats_qs = Seat.objects.filter(movie_room=showtime.movie_room)

        # Auto-create a simple seat map if this room has no seats yet.
        if not seats_qs.exists():
            bulk = []
            rows = [chr(c) for c in range(ord("A"), ord("H") + 1)]  # A-H
            for row in rows:
                for num in range(1, 13):  # 12 seats per row
                    bulk.append(Seat(movie_room=showtime.movie_room, row=row, number=num))
            Seat.objects.bulk_create(bulk)
            seats_qs = Seat.objects.filter(movie_room=showtime.movie_room)

        reserved_seats = Ticket.objects.filter(showtime=showtime).values_list("seat_id", flat=True)

        data = []
        for seat in seats_qs:
            data.append({
                "id": seat.id,
                "row": seat.row,
                "number": seat.number,
                "isReserved": seat.id in reserved_seats
            })

        return Response(data, status=200)


# ---------------------------------------------------------
# BOOKING VIEWSET
# ---------------------------------------------------------
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Create booking for a user and generate corresponding tickets.
        """
        user = request.user
        customer, _ = Customer.objects.get_or_create(user=user)

        showtime_id = request.data.get("showtime")
        seat_payload = request.data.get("seats", [])
        payment_method = request.data.get("payment_method")
        payment_last4 = request.data.get("payment_last4")
        payment_card_id = request.data.get("payment_card_id")
        promo_code = str(request.data.get("promo_code") or "").strip()

        if not showtime_id or not seat_payload:
            return Response({"error": "showtime and seats are required"}, status=400)

        # If client provides a saved card, trust it as the payment method
        if payment_card_id:
            try:
                card = PaymentCard.objects.get(id=payment_card_id, user=user)
                payment_method = payment_method or "saved-card"
                try:
                    payment_last4 = card.card_number[-4:]
                except Exception:
                    payment_last4 = None
            except PaymentCard.DoesNotExist:
                return Response({"error": "Payment card not found"}, status=404)

        if not payment_method:
            return Response({"error": "payment_method is required"}, status=400)
        # payment_last4 is optional, used only for display

        showtime = get_object_or_404(Showtime, pk=showtime_id)

        # Optional promotion validation
        promo = None
        if promo_code:
            try:
                promo = Promotion.objects.get(promo_code__iexact=promo_code)
            except Promotion.DoesNotExist:
                return Response({"error": "Promo code not found"}, status=404)

            if not promo.is_active():
                return Response({"error": "Promo code is expired or inactive"}, status=400)

        # Normalize seats payload into {seat_id: ticket_type}
        seat_type_map = {}
        seat_ids = []
        for item in seat_payload:
            if isinstance(item, dict):
                sid = item.get("seat") or item.get("id")
                ticket_type = item.get("ticket_type") or item.get("type") or Ticket.TicketType.ADULT
            else:
                sid = item
                ticket_type = Ticket.TicketType.ADULT

            try:
                sid_int = int(sid)
            except (TypeError, ValueError):
                return Response({"error": "Invalid seat id provided"}, status=400)

            ticket_type = str(ticket_type).upper()
            if ticket_type not in Ticket.TicketType.values:
                return Response({"error": f"Invalid ticket_type for seat {sid_int}"}, status=400)

            seat_type_map[sid_int] = ticket_type
            seat_ids.append(sid_int)

        seats = Seat.objects.filter(id__in=seat_ids, movie_room=showtime.movie_room).order_by("id")
        if seats.count() != len(seat_ids):
            return Response({"error": "Invalid seat selection"}, status=400)

        with transaction.atomic():
            # Lock existing tickets for these seats/showtime to avoid race conditions
            existing_tickets = (
                Ticket.objects.select_for_update()
                .filter(showtime=showtime, seat__in=seats)
            )
            if existing_tickets.exists():
                return Response({"error": "One or more seats are already booked"}, status=409)

            booking = Booking.objects.create(customer=customer, total_amount=0)

            multipliers = {
                Ticket.TicketType.ADULT: Decimal("1.0"),
                Ticket.TicketType.STUDENT: Decimal("0.90"),
                Ticket.TicketType.CHILD: Decimal("0.80"),
                Ticket.TicketType.SENIOR: Decimal("0.85"),
            }

            total_price = Decimal("0")
            created_tickets = []

            for seat in seats:
                ticket_type = seat_type_map.get(seat.id, Ticket.TicketType.ADULT)
                ticket_price = Decimal(showtime.base_price) * multipliers.get(ticket_type, Decimal("1.0"))
                ticket = Ticket.objects.create(
                    booking=booking,
                    showtime=showtime,
                    seat=seat,
                    price=ticket_price,
                    ticket_type=ticket_type
                )
                total_price += ticket_price
                created_tickets.append(ticket)

            total_before_discount = total_price
            discount_amount = Decimal("0")

            if promo:
                discount_amount = (
                    total_before_discount * Decimal(promo.discount_percent) / Decimal("100")
                ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                total_price = max(Decimal("0.00"), total_before_discount - discount_amount)
                booking.promo_code = promo.promo_code

            booking.total_amount = total_price
            booking.status = Booking.Status.CONFIRMED
            booking.save()

        pricing = {
            "total_before_discount": str(total_before_discount),
            "discount_amount": str(discount_amount),
            "total_after_discount": str(total_price),
        }

        if promo:
            pricing["promo_code"] = promo.promo_code
            pricing["discount_percent"] = str(promo.discount_percent)

        return Response(
            {
                "booking": BookingSerializer(booking).data,
                "tickets": TicketSerializer(created_tickets, many=True).data,
                "payment": {"method": payment_method, "card_last4": payment_last4},
                "pricing": pricing,
            },
            status=201
        )

    @action(detail=False, methods=["get"])
    def my(self, request):
        """Return bookings belonging to logged-in user."""
        user = request.user
        customer = getattr(user, "customer_profile", None)

        # Auto-create customer profile if it doesn't exist
        if not customer:
            customer, created = Customer.objects.get_or_create(user=user)
            if created:
                # No bookings yet for a new customer
                return Response([], status=200)

        bookings = Booking.objects.filter(customer=customer).order_by("-created_at")
        return Response(BookingSerializer(bookings, many=True).data, status=200)
