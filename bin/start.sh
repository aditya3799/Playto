#!/bin/bash
set -e

echo "Starting Redis server..."
redis-server --daemonize yes

echo "Running migrations..."
python backend/manage.py migrate --noinput

echo "Collecting static files..."
python backend/manage.py collectstatic --noinput

echo "Starting Celery worker..."
celery -A payout_engine worker --loglevel=info --chdir backend &

echo "Starting Gunicorn..."
gunicorn payout_engine.wsgi:application --bind 0.0.0.0:8080 --chdir backend
