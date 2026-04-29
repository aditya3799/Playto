# Playto Payout Engine

A high-integrity, concurrency-safe payout engine designed to facilitate international payment collections for agencies and freelancers. Built with Django, React, and Celery.

## 🚀 Features
- **Atomic Ledger**: Double-entry ledger system for immutable financial records.
- **Concurrency Safety**: Pessimistic database locking (`select_for_update`) to prevent double-spending.
- **Idempotency**: Robust handling of retried requests via unique idempotency keys.
- **Background Processing**: Resilient payout state machine transitions using Celery workers.
- **Modern UI**: Intuitive merchant dashboard built with React and Tailwind CSS.

## 🛠 Tech Stack
- **Backend**: Python, Django, Django REST Framework
- **Frontend**: React (Vite), Tailwind CSS
- **Database**: PostgreSQL
- **Task Queue**: Redis, Celery
- **Deployment**: Docker, Docker Compose

---

## 💻 Local Installation

### Prerequisites
- Docker & Docker Compose installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/aditya3799/Playto.git
cd Playto
```

### 2. Build and Start the containers
```bash
docker compose up -d --build
```

### 3. Setup the Database
Run migrations and populate the database with sample merchant data:
```bash
# Run migrations
docker compose exec web python backend/manage.py migrate

# Seed sample data
docker compose exec web python backend/manage.py seed_data

# Create an admin user (optional)
docker compose exec web python backend/manage.py createsuperuser
```

### 4. Access the Application
- **Frontend**: [http://localhost](http://localhost) (or port 80)
- **Django Admin**: [http://localhost/admin](http://localhost/admin)

---

## ☁️ Deployment (AWS EC2)

The application is configured to be deployed using Docker Compose on any Linux VM.

### Setup Steps:
1. SSH into your EC2 instance.
2. Clone the repository.
3. Follow the **Local Installation** steps above.
4. Ensure your **Security Group** allows inbound traffic on Port 80 (HTTP).

### GitHub Actions
A CI/CD pipeline is included in `.github/workflows/deploy.yml` to automatically deploy changes to your EC2 instance on every push to the `main` branch.

---

## 📖 Documentation
For a deep dive into the technical architecture, concurrency patterns, and the "AI Audit," please refer to [EXPLAINER.md](./EXPLAINER.md).
