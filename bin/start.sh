#!/bin/bash
set -e

# Use the redis container from docker-compose, no local server needed
cd /app/backend

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Celery Beat..."
celery -A payout_engine beat --loglevel=info &

echo "Starting Celery worker..."
export PYTHONPATH=$PYTHONPATH:.
celery -A payout_engine worker --loglevel=info --concurrency=1 &

echo "Starting Gunicorn..."
gunicorn payout_engine.wsgi:application --bind 0.0.0.0:8080 --timeout 120
