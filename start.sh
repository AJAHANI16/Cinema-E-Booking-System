#!/bin/bash
set -e  # exit immediately on error

MARKER_FILE=".setup_done"

# ==== LOAD ENVIRONMENT VARIABLES ====
ENV_FILE="./.env"

if [ -f "$ENV_FILE" ]; then
  echo "Loading environment variables from $ENV_FILE..."
  # This version handles quotes, spaces, and comments properly
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "No .env file found at $ENV_FILE — using defaults"
fi

# Set defaults if not provided in .env
DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME:-admin}
DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL:-admin@example.com}
DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-password}

# Sanity check to avoid Django crash if vars missing
if [ -z "$DJANGO_SUPERUSER_USERNAME" ]; then
  echo "Error: DJANGO_SUPERUSER_USERNAME is not set. Check your .env file."
  exit 1
fi

# ==== FIRST-TIME SETUP ====
if [ ! -f "cinemaProject/$MARKER_FILE" ]; then
  echo "Running first-time setup..."

  # --- Backend setup ---
  cd cinemaProject/backend
  VENV_DIR="$HOME/.virtualenvs/cinema_backend"

  if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment in $VENV_DIR..."
    python3 -m venv "$VENV_DIR"
  fi

  echo "Activating virtual environment and installing dependencies..."
  source "$VENV_DIR/bin/activate"
  pip install --upgrade pip
  pip install -r requirements.txt

  echo "Running database migrations..."
  python manage.py makemigrations --noinput
  python manage.py migrate --noinput

  echo "Clearing all existing Django users..."
  python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.all().delete()"

  echo "Creating Django superuser (${DJANGO_SUPERUSER_USERNAME})..."
  python manage.py createsuperuser \
    --noinput \
    --username "$DJANGO_SUPERUSER_USERNAME" \
    --email "$DJANGO_SUPERUSER_EMAIL" || echo "Superuser may already exist."

  python manage.py shell -c "from django.contrib.auth import get_user_model; \
  User = get_user_model(); \
  u, _ = User.objects.get_or_create(username='$DJANGO_SUPERUSER_USERNAME', defaults={'email': '$DJANGO_SUPERUSER_EMAIL'}); \
  u.set_password('$DJANGO_SUPERUSER_PASSWORD'); \
  u.is_superuser = True; \
  u.is_staff = True; \
  u.save(); \
  print(f'Superuser \"{u.username}\" ready.')"

  echo "Marking superuser as verified..."  # <-- NEW
  python manage.py shell -c "from django.contrib.auth import get_user_model; from posts.models import UserProfile; \
User = get_user_model(); \
u = User.objects.get(username='$DJANGO_SUPERUSER_USERNAME'); \
profile, _ = UserProfile.objects.get_or_create(user=u); \
profile.is_verified = True; \
profile.save(); \
print(f'Superuser {u.username} marked verified.')"  # <-- NEW

  deactivate
  cd ../..

  # --- Frontend setup ---
  if [ -d "cinemaProject/frontend" ]; then
    echo "Installing frontend dependencies..."
    cd cinemaProject/frontend
    npm install
    cd ../..
  else
    echo "Frontend directory not found, skipping npm install..."
  fi

  # Mark setup done
  touch "cinemaProject/$MARKER_FILE"
  echo "Setup complete."
fi

# ==== START SERVERS ====

cd cinemaProject/backend
VENV_DIR="$HOME/.virtualenvs/cinema_backend"

echo "Starting Django backend..."
source "$VENV_DIR/bin/activate" 2>/dev/null || {
  echo "Virtual environment not found in $VENV_DIR, run setup first!"
  exit 1
}
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput
python3 manage.py runserver &
BACKEND_PID=$!

# Optional seed script
python3 seed.py &

# Frontend
cd ../frontend
echo "Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

# Graceful shutdown
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID" EXIT

wait