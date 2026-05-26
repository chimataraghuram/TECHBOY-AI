# TECHBOY AI - Cloud-Native AI Agent Platform

A modern AI task automation assistant inspired by ChatGPT-style interfaces, focused on real-world task execution and conversational workflows.

## Architecture

```text
Frontend (React + Vite) → FastAPI Backend → Agent Orchestrator → Gemini API
                                                                → Gmail API
                                                                → Telegram API
                                                ↕
                                          MongoDB Atlas
```

## Tech Stack
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS, framer-motion
- **Backend**: FastAPI, Python 3.12, Motor (async MongoDB), JWT Auth
- **AI Layer**: Google Gemini API via official `google-genai` SDK
- **Database**: MongoDB Atlas

## Features
- 🔐 Full JWT authentication system (signup/login)
- 🤖 Real-time chat streaming via Server-Sent Events (SSE)
- 🧠 Intent classification and agentic workflow orchestration
- 📧 Gmail tool execution (send emails)
- 📱 Telegram bot tool execution (send notifications)
- 📝 Notes tool (save structured text)
- 🌙 Responsive glassmorphism UI with animated splash screens
- 🐳 Fully Dockerized backend for easy deployment

## Quick Start

### Backend
1. `cd backend`
2. Copy `.env.example` to `.env` and fill in your keys (MongoDB, Gemini, etc.)
3. `pip install -r requirements.txt`
4. `python -m uvicorn app.main:app --reload`
*Or use Docker: `docker-compose up -d` from the root directory.*

### Frontend
1. Make sure `backend` is running on `http://localhost:8000`
2. `cd frontend`
3. `npm install`
4. `npm run dev`

## Deployment
The backend is ready to be deployed via Docker to AWS EC2, Render, or any VPS.
The frontend can be deployed statically to Vercel or GitHub Pages (configure the VITE_API_URL environment variable during build, and set the root directory to `frontend/`).
