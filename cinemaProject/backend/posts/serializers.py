from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import (
    Booking,
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


# ============================
# MOVIES
# ============================
class MovieSerializer(serializers.ModelSerializer):
    """Serializer for Movie model."""
    poster = serializers.URLField(source="movie_poster_URL", read_only=True)
    trailerId = serializers.CharField(source="trailer_id", read_only=True)
    releaseDate = serializers.DateField(source="release_date", read_only=True)
    showtimes = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = [
            "id", "slug", "title", "description", "rating", "poster",
            "genre", "category", "showtimes", "trailerId", "releaseDate", "duration"
        ]

    def get_showtimes(self, obj):
        upcoming = (
            Showtime.objects.filter(movie=obj, starts_at__gte=timezone.now())
            .select_related("movie_room")
            .order_by("starts_at")
        )

        return [
            {
                "id": showtime.id,
                "starts_at": showtime.starts_at.isoformat(),
                "format": showtime.format,
                "base_price": showtime.base_price,
                "movie_room": showtime.movie_room_id,
                "movie_room_name": getattr(showtime.movie_room, "name", None),
            }
            for showtime in upcoming
        ]


# ============================
# USER PROFILE
# ============================
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "street_address", "city", "state", "zip_code",
            "subscribed_to_promotions", "is_verified"
        ]
        read_only_fields = ["is_verified"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "date_joined", "profile", "is_admin", "is_staff"
        ]

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser


# ============================
# USER REGISTRATION
# ============================
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    subscribed_to_promotions = serializers.BooleanField(default=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "password_confirm",
            "first_name", "last_name", "subscribed_to_promotions"
        ]

    def validate(self, attrs):
        # password match
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})

        # unique email
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email is already registered"})

        # unique username
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Username already exists"})

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        subscribed = validated_data.pop("subscribed_to_promotions", False)

        user = User.objects.create_user(**validated_data)
        user.is_active = False
        user.save()

        UserProfile.objects.get_or_create(
            user=user,
            defaults={"subscribed_to_promotions": subscribed}
        )

        return user


# ============================
# PAYMENT CARDS
# ============================
class PaymentCardSerializer(serializers.ModelSerializer):
    card_number_masked = serializers.SerializerMethodField()

    class Meta:
        model = PaymentCard
        fields = [
            "id", "card_number", "card_number_masked", "card_holder_name",
            "expiry_month", "expiry_year", "cvv",
            "billing_street", "billing_city", "billing_state", "billing_zip",
            "is_default", "created_at"
        ]
        extra_kwargs = {
            "card_number": {"write_only": True},
            "cvv": {"write_only": True},
        }

    def get_card_number_masked(self, obj):
        if obj.card_number:
            return f"****-****-****-{obj.card_number[-4:]}"
        return ""

    def validate_card_number(self, value):
        clean = value.replace(" ", "").replace("-", "")
        if not clean.isdigit():
            raise serializers.ValidationError("Card number must contain only digits")
        if len(clean) not in [15, 16]:
            raise serializers.ValidationError("Card number must be 15 or 16 digits")
        return value

    def validate_expiry_month(self, value):
        if not 1 <= value <= 12:
            raise serializers.ValidationError("Month must be between 1 and 12")
        return value

    def validate_expiry_year(self, value):
        from datetime import datetime
        year = datetime.now().year
        if value < year:
            raise serializers.ValidationError("Card is expired")
        if value > year + 20:
            raise serializers.ValidationError("Invalid expiry year")
        return value

    def validate_cvv(self, value):
        if not value.isdigit() or len(value) not in [3, 4]:
            raise serializers.ValidationError("CVV must be 3 or 4 digits")
        return value


# ============================
# PROFILE UPDATE
# ============================
class ProfileUpdateSerializer(serializers.ModelSerializer):
    street_address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    zip_code = serializers.CharField(required=False, allow_blank=True)
    subscribed_to_promotions = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            "first_name", "last_name",
            "street_address", "city", "state", "zip_code",
            "subscribed_to_promotions"
        ]

    def update(self, instance, validated_data):
        # Update user fields
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.save()

        # Update profile
        profile = instance.profile
        profile.street_address = validated_data.get("street_address", profile.street_address)
        profile.city = validated_data.get("city", profile.city)
        profile.state = validated_data.get("state", profile.state)
        profile.zip_code = validated_data.get("zip_code", profile.zip_code)
        profile.subscribed_to_promotions = validated_data.get(
            "subscribed_to_promotions", profile.subscribed_to_promotions
        )
        profile.save()

        return instance


# ============================
# PASSWORD CHANGE
# ============================
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords don't match"})
        return attrs

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


# ============================
# ADMIN PANEL: PROMOTIONS
# ============================
class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = "__all__"


# ============================
# ADMIN PANEL: MOVIE ROOMS
# ============================
class MovieRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieRoom
        fields = "__all__"


# ============================
# ADMIN PANEL: SHOWTIMES
# ============================
class ShowtimeSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)

    class Meta:
        model = Showtime
        fields = "__all__"

    def validate(self, attrs):
        movie_room = attrs.get("movie_room") or getattr(self.instance, "movie_room", None)
        starts_at = attrs.get("starts_at") or getattr(self.instance, "starts_at", None)

        if movie_room and starts_at:
            qs = Showtime.objects.filter(movie_room=movie_room, starts_at=starts_at)
            if self.instance and self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "Another movie is already scheduled in this showroom at that time."
                )

        return attrs


class ShowroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Showroom
        fields = "__all__"


# ============================
# SEATS / BOOKINGS
# ============================
class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ["id", "row", "number"]


class ShowtimeSummarySerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    movie_slug = serializers.CharField(source="movie.slug", read_only=True)
    movie_room_name = serializers.CharField(source="movie_room.name", read_only=True)

    class Meta:
        model = Showtime
        fields = ["id", "starts_at", "format", "movie_title", "movie_slug", "movie_room_name"]


class TicketSerializer(serializers.ModelSerializer):
    seat = SeatSerializer()
    showtime = ShowtimeSummarySerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ["id", "seat", "price", "ticket_type", "showtime"]


class BookingSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True)

    class Meta:
        model = Booking
        fields = ["id", "created_at", "status", "total_amount", "tickets"]
