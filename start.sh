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
  if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
  fi

  echo "Installing Python dependencies..."
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt

  echo "Running database migrations..."
  python manage.py migrate

  echo "Creating Django superuser (${DJANGO_SUPERUSER_USERNAME})..."
  echo "Clearing all existing Django users..."
  python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.all().delete()"

  echo "Creating Django superuser (${DJANGO_SUPERUSER_USERNAME})..."
  # Create superuser if missing
  python manage.py createsuperuser \
    --noinput \
    --username "$DJANGO_SUPERUSER_USERNAME" \
    --email "$DJANGO_SUPERUSER_EMAIL" || echo "Superuser may already exist."

  python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.get(username='$DJANGO_SUPERUSER_USERNAME')
u.set_password('$DJANGO_SUPERUSER_PASSWORD')
u.save()
print(f'Password set for {u.username}')
"

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

  # Run seed script (optional)
  python3 seed.py &

  # Mark setup done
  touch "cinemaProject/$MARKER_FILE"
  echo "Setup complete."
fi

# ==== START SERVERS ====

# Go to backend and start Django server
cd cinemaProject/backend
echo "Starting Django backend..."
source venv/bin/activate 2>/dev/null || echo "venv not found, run setup first!"
python3 manage.py runserver &
BACKEND_PID=$!

# Go to frontend and start React app
cd ../frontend
echo "Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both processes cleanly
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID" EXIT

# Keep both running
wait
