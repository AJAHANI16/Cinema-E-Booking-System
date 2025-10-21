# posts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Movie

class MovieSerializer(serializers.ModelSerializer):
    # Rename fields to camelCase for frontend
    poster = serializers.URLField(source="movie_poster_URL", read_only=True)
    trailerId = serializers.CharField(source="trailer_id", read_only=True)  # 👈 updated
    releaseDate = serializers.DateField(source="release_date", read_only=True)
    duration = serializers.IntegerField(read_only=True)
    category = serializers.CharField(default="currently-running")
    showtimes = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "rating",
            "poster",
            "genre",
            "category",
            "showtimes",
            "trailerId",
            "releaseDate",
            "duration",
        ]

    def get_showtimes(self, obj):
        # Always return a list (fallback hardcoded for now)
        return ["2:00 PM", "5:00 PM", "8:00 PM"]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data (safe for sending to frontend)"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("A user with this email already exists")
        
        # Check if username already exists
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError("A user with this username already exists")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user
