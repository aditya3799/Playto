#!/bin/bash
set -e

# Start Redis
echo "Starting Redis server..."
redis-server --daemonize yes

# Navigate to the backend directory for Django/Celery operations
cd /app/backend

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Celery worker..."
# Set PYTHONPATH to current directory (backend) so payout_engine is found
export PYTHONPATH=$PYTHONPATH:.
celery -A payout_engine worker --loglevel=info &

echo "Starting Gunicorn..."
# Run Gunicorn with an increased timeout
gunicorn payout_engine.wsgi:application --bind 0.0.0.0:8080 --timeout 120
