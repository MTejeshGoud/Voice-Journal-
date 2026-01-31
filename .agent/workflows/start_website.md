---
description: How to start the full stack application
---

This workflow starts the backend (Node.js), the processing worker (Python Celery), and the frontend (React/Vite).

**Prerequisites:**
- Ensure **Redis** is installed and running on default port 6379.

1. Start the Node.js Backend Server
// turbo
```bash
cd backend
node server.js
```

2. Start the Python Celery Worker
// turbo
```bash
cd backend-py
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\celery.exe -A celery_app.celery_app worker --loglevel=info --pool=solo
```

3. Start the Frontend Server
// turbo
```bash
cd frontend
npm run dev
```

4. Verify
Open http://localhost:5173 in your browser.
