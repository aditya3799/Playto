# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM python:3.10-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY bin/ ./bin/
RUN chmod +x bin/start.sh

# Copy frontend build to a static directory where Django can find it
RUN mkdir -p backend/static
COPY --from=frontend-builder /app/frontend/dist ./backend/static/dist

# Expose port
EXPOSE 8080

# Default command (will be overridden for workers)
CMD ["./bin/start.sh"]
