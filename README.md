# Voice Journal

A full-stack voice journaling application that allows users to record audio, which is then transcribed asynchronously using the Groq API.

## Tech Stack

- **Frontend:** React, Vite, React Router, Standard CSS
- **Backend API:** Node.js, Express, MongoDB (Mongoose), Redis (IORedis)
- **Task Worker:** Python, Celery, Groq API (for transcription)
- **Database:** MongoDB
- **Queue:** Redis

## Prerequisites

Before running the application, ensure you have the following installed and running:

- **Node.js** (v16+)
- **Python** (v3.8+)
- **MongoDB** (Running on default port `27017`)
- **Redis** (Running on default port `6379`)

## Environment Variables

You need to configure environment variables for both the Node.js backend and the Python worker.

### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
# MongoDB URI is currently hardcoded to mongodb://localhost:27017/voicejournaldb in db.js
```

### Worker (`backend-py/.env`)

Create a `.env` file in the `backend-py/` directory:

```env
GROQ_API_KEY=your_groq_api_key
```

## Installation

### 1. Backend (Node.js)

```bash
cd backend
npm install
```

### 2. Worker (Python)

It is recommended to use a virtual environment.

```bash
cd backend-py
python -m venv .venv
# Activate Virtual Env (Windows)
.venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend (React)

```bash
cd frontend
npm install
```

## Running the Application

You need to run three separate processes.

### 1. Start the Backend API

```bash
cd backend
node server.js
```
*Server will start on http://localhost:5000*

### 2. Start the Celery Worker

The worker handles background transcription tasks.

```bash
cd backend-py
# Ensure you are in the virtual environment
.venv\Scripts\celery -A celery_app.celery_app worker --loglevel=info --pool=solo
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```
*Frontend will be available at http://localhost:5173*

## Features

- User Authentication (Login/Register)
- Audio Recording & Upload
- Asynchronous Transcription (via Celery & Groq)
- View Transcripts & History
