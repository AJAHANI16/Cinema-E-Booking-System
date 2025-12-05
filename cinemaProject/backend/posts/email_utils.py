# posts/email_utils.py
from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags
from django.utils import timezone


def send_verification_email(user, token):
    """Send email verification link to user"""
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
    
    subject = 'Verify Your Cinema E-Booking Account'
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Welcome to Cinema E-Booking!</h2>
                <p>Hi {user.first_name or user.username},</p>
                <p>Thank you for registering with Cinema E-Booking System. Please verify your email address to activate your account.</p>
                <div style="margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">{verification_url}</p>
                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                    This link will expire in 24 hours. If you didn't create an account, please ignore this email.
                </p>
            </div>
        </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_password_reset_email(user, token):
    """Send password reset link to user"""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
    
    subject = 'Reset Your Cinema E-Booking Password'
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Password Reset Request</h2>
                <p>Hi {user.first_name or user.username},</p>
                <p>We received a request to reset your password for your Cinema E-Booking account.</p>
                <div style="margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">{reset_url}</p>
                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </p>
            </div>
        </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_booking_confirmation_email(user, booking, tickets):
    """Send a simple booking confirmation email with ticket details."""
    if not user.email:
        return False

    subject = f"Booking #{booking.id} confirmed – Cinema E-Booking"

    showtime = tickets[0].showtime if tickets else None
    showtime_str = (
        showtime.starts_at.astimezone(timezone.get_current_timezone()).strftime("%b %d, %Y at %I:%M %p")
        if getattr(showtime, "starts_at", None)
        else "TBD"
    )
    movie_title = getattr(showtime, "movie", None).title if getattr(showtime, "movie", None) else "Your movie"
    seat_list = ", ".join(f"{t.seat.row}{t.seat.number}" for t in tickets) if tickets else "N/A"

    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Your booking is confirmed!</h2>
                <p>Hi {user.first_name or user.username},</p>
                <p>Thanks for booking with Cinema E-Booking. Here are your details:</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
                    <p style="margin: 0;"><strong>Movie:</strong> {movie_title}</p>
                    <p style="margin: 6px 0 0 0;"><strong>Showtime:</strong> {showtime_str}</p>
                    <p style="margin: 6px 0 0 0;"><strong>Seats:</strong> {seat_list}</p>
                    <p style="margin: 6px 0 0 0;"><strong>Total:</strong> ${booking.total_amount}</p>
                    {"<p style='margin:6px 0 0 0;'><strong>Promo code:</strong> " + booking.promo_code + "</p>" if booking.promo_code else ""}
                </div>
                <p>Your tickets are available in the My Tickets section of the app.</p>
                <p style="margin-top: 24px;">Enjoy the show!<br/>Cinema E-Booking Team</p>
            </div>
        </body>
    </html>
    """
    plain_message = strip_tags(html_message)

    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )
    return True


def send_profile_change_notification(user):
    """Send notification when user profile is changed"""
    subject = 'Your Cinema E-Booking Profile Has Been Updated'
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Profile Update Notification</h2>
                <p>Hi {user.first_name or user.username},</p>
                <p>This is a confirmation that your Cinema E-Booking profile information has been successfully updated.</p>
                <p>If you did not make these changes, please contact our support team immediately or reset your password as a security precaution.</p>
                <div style="margin: 30px 0; padding: 15px; background-color: #F3F4F6; border-radius: 5px;">
                    <p style="margin: 0;"><strong>Account Email:</strong> {user.email}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Updated:</strong> Just now</p>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                    This is an automated security notification from Cinema E-Booking System.
                </p>
            </div>
        </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_welcome_email(user):
    """Send welcome email after successful verification"""
    subject = 'Welcome to Cinema E-Booking!'
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Your Account is Active!</h2>
                <p>Hi {user.first_name or user.username},</p>
                <p>Your email has been verified and your Cinema E-Booking account is now active.</p>
                <p>You can now:</p>
                <ul>
                    <li>Browse and search for movies</li>
                    <li>Book tickets for your favorite films</li>
                    <li>Manage your profile and payment methods</li>
                    <li>Receive exclusive promotions (if opted in)</li>
                </ul>
                <div style="margin: 30px 0;">
                    <a href="{settings.FRONTEND_URL}/login" 
                       style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Start Booking Now
                    </a>
                </div>
                <p>Enjoy your movie experience!</p>
            </div>
        </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )
def send_promotion_email_to_subscribers(promotion):
    """Send promotion details to all users subscribed to marketing emails."""
    from .models import UserProfile  # Local import to avoid circular dependencies

    subscribers = (
        UserProfile.objects.filter(subscribed_to_promotions=True)
        .select_related("user")
        .exclude(user__email="")
    )

    if not subscribers.exists():
        return 0

    subject = f"{promotion.promo_code} – Save {promotion.discount_percent}% at Cinema E-Booking"

    count = 0
    for profile in subscribers:
        user = profile.user
        greeting_name = user.first_name or user.username or "Movie Fan"
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4F46E5;">Exclusive Promotion Just for You!</h2>
                    <p>Hi {greeting_name},</p>
                    <p>We have a special offer waiting: enjoy <strong>{promotion.discount_percent}% off</strong> your next booking.</p>
                    <div style="margin: 20px 0; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
                        <p style="margin: 0; font-size: 16px;"><strong>Promo Code:</strong> {promotion.promo_code}</p>
                        <p style="margin: 8px 0 0 0;">Valid from {promotion.start_date:%b %d, %Y} to {promotion.end_date:%b %d, %Y}</p>
                    </div>
                    <p>{promotion.description or "Use this code at checkout to save on your next visit."}</p>
                    <p style="margin-top: 24px;">Happy viewing,<br/>Cinema E-Booking Team</p>
                </div>
            </body>
        </html>
        """
        plain_message = strip_tags(html_message)

        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_message,
                fail_silently=False,
            )
            count += 1
        except Exception as e:
            # Log and continue so one failure doesn't block others
            print(f"Failed to send promo email to {user.email}: {e}")

    return count
