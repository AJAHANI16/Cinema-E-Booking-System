from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Movie, UserProfile, PaymentCard


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
        return ["2:00 PM", "5:00 PM", "8:00 PM"]


class UserProfileSerializer(serializers.ModelSerializer):
    """Nested serializer for UserProfile."""
    class Meta:
        model = UserProfile
        fields = [
            "street_address", "city", "state", "zip_code",
            "subscribed_to_promotions", "is_verified"
        ]
        read_only_fields = ["is_verified"]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for sending safe user data to frontend."""
    profile = UserProfileSerializer(read_only=True)
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "date_joined", "profile", "is_admin"
        ]

    def get_is_admin(self, obj):
        return obj.is_staff or obj.is_superuser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
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
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists"})
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "This username is already taken"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        subscribed_to_promotions = validated_data.pop("subscribed_to_promotions", False)
        user = User.objects.create_user(**validated_data)
        user.is_active = False
        user.save()
        UserProfile.objects.get_or_create(
            user=user, defaults={"subscribed_to_promotions": subscribed_to_promotions}
        )
        return user


class PaymentCardSerializer(serializers.ModelSerializer):
    """Serializer for encrypted payment cards."""
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
        current_year = datetime.now().year
        if value < current_year:
            raise serializers.ValidationError("Card has expired")
        if value > current_year + 20:
            raise serializers.ValidationError("Expiry year seems invalid")
        return value

    def validate_cvv(self, value):
        if not value.isdigit() or len(value) not in [3, 4]:
            raise serializers.ValidationError("CVV must be 3 or 4 digits")
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user and related profile data."""
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
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.save()

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


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password."""
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