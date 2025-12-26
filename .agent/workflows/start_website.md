---
description: How to start the full stack application
---

This workflow starts the backend (Node.js) and frontend (React/Vite) servers.

1. Install backend dependencies (if not already done)
// turbo
```bash
cd backend
npm install ioredis
```

2. Start the Backend Server
// turbo
```bash
cd backend
node server.js
```

3. Start the Frontend Server
// turbo
```bash
cd frontend
npm run dev
```

4. Verify
Open http://localhost:5173 in your browser.
