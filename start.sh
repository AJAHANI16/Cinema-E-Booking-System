#!/bin/bash

# go to backend and start django server
cd cinemaProject/backend
echo "Starting Django backend..."
source venv/bin/activate 2>/dev/null || echo "no venv found"
python3 manage.py runserver &

# backend PID
BACKEND_PID=$!

# Go to frontend and start React app
cd ../cinema-e-Booking
echo "Starting React frontend..."
npm run dev &

# frontend PID
FRONTEND_PID=$!

# traps ctrl+c to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

# keeps both running
wait
