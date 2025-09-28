#!/bin/bash
set -e  # exit immediately on error

MARKER_FILE=".setup_done"

# ==== FIRST-TIME SETUP ====
if [ ! -f "$MARKER_FILE" ]; then
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
  touch "$MARKER_FILE"
  echo "Setup complete."
fi

# ==== START SERVERS ====

# go to backend and start django server
cd cinemaProject/backend
echo "Starting Django backend..."
source venv/bin/activate 2>/dev/null || echo "⚠venv not found, run setup first!"
python3 manage.py runserver &
BACKEND_PID=$!

# run seed script
python3 seed.py &

# go to frontend and start React app
cd ../frontend
echo "Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

# trap ctrl+c to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

# keep both running
wait