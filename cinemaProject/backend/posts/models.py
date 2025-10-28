from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator
from encrypted_model_fields.fields import EncryptedCharField
import uuid
from datetime import timedelta


# ---------------------------------------------------------
# MOVIE MODEL
# ---------------------------------------------------------
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


# ---------------------------------------------------------
# USER PROFILE
# ---------------------------------------------------------
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


# ---------------------------------------------------------
# PAYMENT CARD (encrypted)
# ---------------------------------------------------------
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
        if not self.pk:
            if PaymentCard.objects.filter(user=self.user).count() >= 4:
                raise ValueError("Cannot add more than 4 payment cards per user")

        if self.is_default:
            PaymentCard.objects.filter(user=self.user).exclude(pk=self.pk).update(is_default=False)

        super().save(*args, **kwargs)


# ---------------------------------------------------------
# MOVIE ROOMS / SEATS / SHOWTIMES
# ---------------------------------------------------------
class MovieRoom(models.Model):
    name = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveIntegerField()

    def __str__(self):
        return self.name


class Seat(models.Model):
    movie_room = models.ForeignKey(MovieRoom, on_delete=models.CASCADE, related_name="seats")
    row = models.CharField(max_length=1)
    number = models.IntegerField()

    class Meta:
        unique_together = (("movie_room", "row", "number"),)

    def __str__(self):
        return f"{self.movie_room.name} - {self.row}{self.number}"


class Showtime(models.Model):
    class Format(models.TextChoices):
        TWO_D = "2D", "2D"
        THREE_D = "3D", "3D"
        IMAX = "IMAX", "IMAX"
        DOLBY = "DOLBY", "Dolby Cinema"

    movie = models.ForeignKey(Movie, on_delete=models.PROTECT, related_name="showtimes")
    movie_room = models.ForeignKey(MovieRoom, on_delete=models.PROTECT, related_name="showtimes")
    starts_at = models.DateTimeField()
    format = models.CharField(max_length=10, choices=Format.choices, default=Format.TWO_D)
    base_price = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(0)])

    class Meta:
        indexes = [models.Index(fields=["starts_at"])]
        unique_together = (("movie_room", "starts_at"),)

    def __str__(self):
        return f"{self.movie.title} @ {self.starts_at:%Y-%m-%d %H:%M} ({self.movie_room.name})"


# ---------------------------------------------------------
# CUSTOMER & BOOKINGS
# ---------------------------------------------------------
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer_profile")
    phone = models.CharField(max_length=20, blank=True)
    loyalty_id = models.CharField(max_length=20, blank=True, unique=True, null=True)

    def __str__(self):
        return self.user.get_username()


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="bookings")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2,
                                       default=0, validators=[MinValueValidator(0)])
    promo_code = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f"Booking #{self.pk} - {self.customer} - {self.status}"


class Ticket(models.Model):
    class TicketType(models.TextChoices):
        ADULT = "ADULT", "Adult"
        STUDENT = "STUDENT", "Student"
        CHILD = "CHILD", "Child"
        SENIOR = "SENIOR", "Senior"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="tickets")
    showtime = models.ForeignKey(Showtime, on_delete=models.PROTECT, related_name="tickets")
    seat = models.ForeignKey(Seat, on_delete=models.PROTECT, related_name="tickets")
    price = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(0)])
    ticket_type = models.CharField(max_length=10, choices=TicketType.choices, default=TicketType.ADULT)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["showtime", "seat"], name="unique_seat_per_showtime"),
        ]

    def __str__(self):
        return f"{self.showtime} - {self.seat} ({self.ticket_type})"


# ---------------------------------------------------------
# SAVED PAYMENT METHODS / CREDIT CARD INFO
# ---------------------------------------------------------
class SavedPaymentMethod(models.Model):
    class MethodType(models.TextChoices):
        CARD = "CARD", "Credit Card"
        PAYPAL = "PAYPAL", "PayPal"
        APPLE_PAY = "APPLE_PAY", "Apple Pay"

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="payment_methods")
    method_type = models.CharField(max_length=20, choices=MethodType.choices, default=MethodType.CARD)
    provider = models.CharField(max_length=30, blank=True)
    provider_ref = models.CharField(max_length=100, blank=True)
    label = models.CharField(max_length=50, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        base = self.label or self.get_method_type_display()
        return f"{self.customer} - {base}"


class CreditCard(models.Model):
    class Brand(models.TextChoices):
        VISA = "VISA", "Visa"
        MASTERCARD = "MASTERCARD", "Mastercard"
        AMEX = "AMEX", "American Express"
        DISCOVER = "DISCOVER", "Discover"
        OTHER = "OTHER", "Other"

    saved_method = models.OneToOneField(SavedPaymentMethod, on_delete=models.CASCADE, related_name="card")

    brand = models.CharField(max_length=20, choices=Brand.choices, default=Brand.OTHER)
    last4 = models.CharField(max_length=4)
    exp_month = models.PositiveSmallIntegerField()
    exp_year = models.PositiveSmallIntegerField()
    cardholder_name = models.CharField(max_length=100, blank=True)
    billing_zip = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.get_brand_display()}, {self.last4} (exp {self.exp_month:02d}/{self.exp_year})"
