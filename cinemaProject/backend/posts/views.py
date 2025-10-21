from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Movie
from .serializers import MovieSerializer, UserRegistrationSerializer, UserSerializer

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    lookup_field = "slug"

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        else:
            # Log the errors for debugging
            print("Registration validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print("Registration exception:", str(e))
        return Response({
            'error': 'An unexpected error occurred during registration'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Allow login with either username or email
    if email and not username:
        try:
            user = User.objects.get(email=email)
            username = user.username
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user"""
    logout(request)
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    return Response({
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth_status(request):
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        return Response({
            'isAuthenticated': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'isAuthenticated': False
        }, status=status.HTTP_200_OK)
