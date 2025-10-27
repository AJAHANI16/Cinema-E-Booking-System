from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.utils import timezone
from encrypted_model_fields.fields import EncryptedCharField
import uuid
from datetime import timedelta


class Movie(models.Model):
    CATEGORY_CHOICES = [
        ("currently-running", "Currently Running"),
        ("coming-soon", "Coming Soon"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    rating = models.CharField(max_length=10)
    duration = models.IntegerField()
    release_date = models.DateField(null=True, blank=True)
    trailer_id = models.CharField(max_length=20, blank=True)
    movie_poster_URL = models.URLField(blank=True)
    genre = models.CharField(max_length=50)
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default="currently-running"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class UserProfile(models.Model):
    """Extended user profile with address, verification, and reset fields."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # Address
    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)

    # Promotions
    subscribed_to_promotions = models.BooleanField(default=False)

    # Verification
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    verification_token_created = models.DateTimeField(null=True, blank=True)

    # Password reset
    reset_token = models.CharField(max_length=100, blank=True, null=True)
    reset_token_created = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

    def generate_verification_token(self):
        self.verification_token = str(uuid.uuid4())
        self.verification_token_created = timezone.now()
        self.save()
        return self.verification_token

    def is_verification_token_valid(self):
        if not self.verification_token_created:
            return False
        expiry = self.verification_token_created + timedelta(hours=24)
        return timezone.now() < expiry

    def generate_reset_token(self):
        self.reset_token = str(uuid.uuid4())
        self.reset_token_created = timezone.now()
        self.save()
        return self.reset_token

    def is_reset_token_valid(self):
        if not self.reset_token_created:
            return False
        expiry = self.reset_token_created + timedelta(hours=1)
        return timezone.now() < expiry


class PaymentCard(models.Model):
    """Encrypted payment card model (up to 4 per user)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payment_cards")

    # Card info
    card_number = EncryptedCharField(max_length=19)
    card_holder_name = models.CharField(max_length=100)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    cvv = EncryptedCharField(max_length=4)

    # Billing address
    billing_street = models.CharField(max_length=255, blank=True)
    billing_city = models.CharField(max_length=100, blank=True)
    billing_state = models.CharField(max_length=50, blank=True)
    billing_zip = models.CharField(max_length=20, blank=True)

    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        try:
            return f"{self.card_holder_name} - ****{self.card_number[-4:]}"
        except Exception:
            return f"{self.card_holder_name} - [encrypted]"

    def save(self, *args, **kwargs):
        # Limit to 4 cards per user
        if not self.pk:
            if PaymentCard.objects.filter(user=self.user).count() >= 4:
                raise ValueError("Cannot add more than 4 payment cards per user")

        # Only one default card
        if self.is_default:
            PaymentCard.objects.filter(user=self.user).exclude(pk=self.pk).update(is_default=False)

        super().save(*args, **kwargs)