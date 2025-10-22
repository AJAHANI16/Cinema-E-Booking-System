#!/usr/bin/env python3
"""
Automatically create a Django superuser if one doesn't exist.
This runs during startup to ensure there's always an admin account available.
"""

import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def create_superuser():
    """Create a superuser if none exists"""
    
    # Check if any superuser already exists
    if User.objects.filter(is_superuser=True).exists():
        print("✅ Superuser already exists, skipping creation.")
        return
    
    # Default superuser credentials (change these for production!)
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
    
    try:
        # Create the superuser
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Superuser created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Access admin at: http://127.0.0.1:8000/admin/")
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

if __name__ == '__main__':
    create_superuser()
