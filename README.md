# PLagiarism — AI-Powered Plagiarism & AI Content Detector

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![React](https://img.shields.io/badge/react-18-61DAFB.svg)

A full-stack web application that detects **plagiarism** and **AI-generated content** using transformer-based ML models, heuristic analysis, and a modern React dashboard.

---

## ✨ Features

- 🔍 **Plagiarism Detection** — Semantic similarity search against a reference corpus using `sentence-transformers`; falls back to Jaccard overlap when the model is unavailable.
- 🤖 **AI Content Detection** — Heuristic analysis of sentence length, vocabulary diversity (type-token ratio), burstiness, and punctuation patterns to estimate the probability that text was AI-generated.
- 📊 **Interactive Dashboard** — Real-time result cards, score gauges, and source attribution displayed in a clean React UI.
- ⚡ **Fast REST API** — Node.js/Express backend proxies requests between the frontend and the Python ML service.
- 🐳 **Docker Compose** — One command spins up MongoDB, Redis, the ML service, the backend, and the frontend.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------------|------------------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js 18, Express, Mongoose, Redis (caching) |
| ML Service | Python 3.11, FastAPI, sentence-transformers, PyTorch |
| Database | MongoDB 7 |
| Cache | Redis 7 |
| Container | Docker, Docker Compose |

---

## 🚀 Quick Start (Docker)

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker + Docker Compose v2.

```bash
# 1. Clone the repo
git clone https://github.com/your-org/PLagiarism.git
cd PLagiarism

# 2. Copy and edit environment variables
cp .env.example .env

# 3. Start all services
docker compose up --build
```

| Service | URL |
|-------------|---------------------------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| ML Service | http://localhost:8000 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

---

## 🧑‍💻 Manual Setup

### Prerequisites

- Node.js ≥ 18
- Python 3.11
- MongoDB running locally
- Redis running locally

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run dev          # http://localhost:5000
```

### ML Service

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description | Default |
|----------------------|---------------------------------------|------------------------------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/…` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret used to sign JWT tokens | *(required)* |
| `JWT_EXPIRES_IN` | JWT token lifetime | `24h` |
| `OPENAI_API_KEY` | OpenAI API key (optional enrichment) | — |
| `HUGGINGFACE_API_KEY`| HuggingFace API key (optional) | — |
| `ML_SERVICE_URL` | URL of the Python ML service | `http://localhost:8000` |
| `VITE_API_URL` | Backend API URL seen by the browser | `http://localhost:5000/api` |

---

## 📡 API Reference

### ML Service (Python/FastAPI — port 8000)

#### `GET /health`

```json
{ "status": "ok", "models_loaded": true }
```

#### `POST /detect/plagiarism`

**Request**
```json
{ "text": "Machine learning enables systems to learn from experience…" }
```

**Response**
```json
{
  "score": 72.4,
  "sources": [
    { "source": "Introduction to Machine Learning (Textbook, 2019)", "similarity": 72.4 },
    { "source": "Deep Learning Fundamentals (Academic Paper, 2020)", "similarity": 31.1 },
    { "source": "Natural Language Processing Overview (Survey, 2021)", "similarity": 18.7 }
  ]
}
```

#### `POST /detect/ai-content`

**Request**
```json
{ "text": "Artificial intelligence encompasses a broad range of techniques…" }
```

**Response**
```json
{
  "score": 65.0,
  "label": "Likely AI Generated",
  "modelProbabilities": { "human": 35.0, "ai": 65.0 },
  "patterns": [
    "Unusually long average sentence length",
    "Highly uniform sentence structure (low burstiness)"
  ]
}
```

> **Labels:** `Human Written` (score < 40) · `Likely AI Generated` (40–70) · `AI Generated` (> 70)

### Backend API (Node.js/Express — port 5000)

| Method | Endpoint | Description |
|--------|--------------------------------|--------------------------------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, receive JWT |
| POST | `/api/detect/plagiarism` | Proxy to ML service + persist result |
| POST | `/api/detect/ai-content` | Proxy to ML service + persist result |
| GET | `/api/history` | Get authenticated user's check history|
| DELETE | `/api/history/:id` | Delete a history record |

---

## 🖼 Screenshots

> _Screenshots coming soon. Run the app locally to see the dashboard._

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).