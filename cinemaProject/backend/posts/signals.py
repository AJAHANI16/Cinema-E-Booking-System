# posts/signals.py
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserProfile

@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    # Create a profile when a user is created
    if created:
        UserProfile.objects.get_or_create(user=instance)
    else:
        # Guarantee the relation exists even for legacy users
        UserProfile.objects.get_or_create(user=instance)