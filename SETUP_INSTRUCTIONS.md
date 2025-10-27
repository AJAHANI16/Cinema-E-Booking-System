# Cinema E-Booking System - Enhanced Authentication Setup

## Backend Setup

### 1. Install Dependencies

```bash
cd cinemaProject/backend
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

### 3. Create Superuser (for Admin Access)

```bash
python3 manage.py createsuperuser
```

### 4. Start Backend Server

```bash
python3 manage.py runserver
```

## New API Endpoints

### Authentication Endpoints

#### Registration
- **POST** `/api/auth/register/`
- Body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string",
  "first_name": "string",
  "last_name": "string",
  "subscribed_to_promotions": boolean
}
```

#### Login
- **POST** `/api/auth/login/`
- Body:
```json
{
  "username": "string", // or "email"
  "password": "string",
  "remember_me": boolean (optional)
}
```

#### Logout
- **POST** `/api/auth/logout/`
- Requires authentication

#### Check Auth Status
- **GET** `/api/auth/status/`

### Email Verification Endpoints

#### Verify Email
- **POST** `/api/auth/verify-email/<token>/`

#### Resend Verification Email
- **POST** `/api/auth/resend-verification/`
- Body:
```json
{
  "email": "string"
}
```

### Password Reset Endpoints

#### Request Password Reset
- **POST** `/api/auth/password-reset/request/`
- Body:
```json
{
  "email": "string"
}
```

#### Reset Password (with token)
- **POST** `/api/auth/password-reset/<token>/`
- Body:
```json
{
  "new_password": "string",
  "new_password_confirm": "string"
}
```

#### Change Password (authenticated)
- **POST** `/api/auth/change-password/`
- Requires authentication
- Body:
```json
{
  "current_password": "string",
  "new_password": "string",
  "new_password_confirm": "string"
}
```

### Profile Management Endpoints

#### Get/Update Profile
- **GET** `/api/auth/profile/` - Get user profile and payment cards
- **PUT** `/api/auth/profile/` - Update profile
- Requires authentication
- PUT Body:
```json
{
  "first_name": "string",
  "last_name": "string",
  "street_address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string",
  "subscribed_to_promotions": boolean
}
```

### Payment Card Endpoints

#### List/Add Cards
- **GET** `/api/auth/payment-cards/` - List all cards
- **POST** `/api/auth/payment-cards/` - Add new card (max 4)
- Requires authentication
- POST Body:
```json
{
  "card_number": "string",
  "card_holder_name": "string",
  "expiry_month": integer (1-12),
  "expiry_year": integer,
  "cvv": "string",
  "billing_street": "string",
  "billing_city": "string",
  "billing_state": "string",
  "billing_zip": "string",
  "is_default": boolean
}
```

#### Update/Delete Card
- **PUT** `/api/auth/payment-cards/<card_id>/` - Update card
- **DELETE** `/api/auth/payment-cards/<card_id>/` - Delete card
- Requires authentication

## Email Configuration

### Development Mode (Console Email Backend)
By default, emails are printed to the console where Django is running. Check the terminal to see verification links and password reset links.

### Production Mode (SMTP)
To use real email sending, update `settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'Cinema E-Booking <your-email@gmail.com>'
```

For Gmail, you'll need to create an "App Password" from your Google Account settings.

## Security Features Implemented

### 1. Email Verification
- Users are created as inactive until email is verified
- Verification tokens expire after 24 hours
- Welcome email sent after successful verification

### 2. Password Security
- Django's built-in password validation (min length, complexity, etc.)
- Password change requires current password verification
- Password reset tokens expire after 1 hour
- Session kept alive after password change (no logout)

### 3. Payment Card Encryption
- Card numbers and CVV are encrypted in database using `django-encrypted-model-fields`
- Only last 4 digits shown in API responses
- Maximum 4 cards per user enforced at model and API level

### 4. Account Status
- Inactive accounts cannot log in
- Unverified emails cannot log in
- Clear error messages for each state

### 5. Session Management
- "Remember Me" extends session to 30 days
- Without "Remember Me", session expires on browser close
- CSRF protection enabled
- CORS configured for frontend

### 6. User Privileges
- Admin flag included in user serializer (`is_admin`)
- Can be used for frontend routing and UI differences
- Protected endpoints require authentication

## Testing the Backend

### 1. Test Registration Flow

```bash
# Register a new user
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User",
    "subscribed_to_promotions": true
  }'

# Check console for verification email with token
# Copy the token from the email URL
```

### 2. Test Email Verification

```bash
# Verify email
curl -X POST http://127.0.0.1:8000/api/auth/verify-email/<TOKEN>/
```

### 3. Test Login

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!",
    "remember_me": true
  }' \
  -c cookies.txt

# This saves cookies for subsequent requests
```

### 4. Test Profile Update

```bash
# Update profile (using saved cookies)
curl -X PUT http://127.0.0.1:8000/api/auth/profile/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "first_name": "Updated",
    "street_address": "123 Main St",
    "city": "Atlanta",
    "state": "GA",
    "zip_code": "30301"
  }'
```

### 5. Test Payment Card Management

```bash
# Add a payment card
curl -X POST http://127.0.0.1:8000/api/auth/payment-cards/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "card_number": "4111111111111111",
    "card_holder_name": "Test User",
    "expiry_month": 12,
    "expiry_year": 2025,
    "cvv": "123",
    "is_default": true
  }'

# List cards
curl -X GET http://127.0.0.1:8000/api/auth/payment-cards/ \
  -b cookies.txt
```

### 6. Test Password Reset

```bash
# Request reset
curl -X POST http://127.0.0.1:8000/api/auth/password-reset/request/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# Check console for reset email with token
# Reset password
curl -X POST http://127.0.0.1:8000/api/auth/password-reset/<TOKEN>/ \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "NewSecurePass123!",
    "new_password_confirm": "NewSecurePass123!"
  }'
```

## Admin Panel

Access the admin panel at `http://127.0.0.1:8000/admin/` to:
- View all registered users
- Check user profiles and verification status
- View payment cards (only last 4 digits shown)
- Manually verify users or reset tokens if needed
- View promotional subscriptions

## Database Encryption Key

**IMPORTANT**: The encryption key in `settings.py` is for development only:

```python
FIELD_ENCRYPTION_KEY = 'your-32-byte-encryption-key-here-change-this-in-production!!'
```

For production, this MUST be:
1. Changed to a secure random key
2. Stored in environment variables, not in code
3. Never committed to version control
4. Backed up securely (if lost, encrypted data is unrecoverable)

Generate a secure key:
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

## Next Steps

After backend is running and tested:
1. Install frontend dependencies: `cd cinemaProject/frontend && npm install`
2. Start frontend: `npm run dev`
3. Frontend will connect to `http://127.0.0.1:8000/api/`

## Troubleshooting

### Migration Errors
```bash
# If you get migration conflicts, try:
python3 manage.py migrate --run-syncdb
```

### Encryption Errors
```bash
# If you get encryption errors after changing the key:
# WARNING: This will lose encrypted data
python3 manage.py flush
python3 manage.py migrate
```

### Import Errors
```bash
# Make sure all dependencies are installed:
pip install -r requirements.txt
```
