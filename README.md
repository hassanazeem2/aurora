# 🔴 AURORA — Autonomous Red Team Simulation Agent

> ⚠️ **SAFE SIMULATION ONLY** — This platform performs NO real attacks.
> All data is synthetic. For educational and portfolio purposes only.

---

## 📁 Project Structure

```
aurora/
├── frontend/              # Next.js 14 + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # UI components
│   │   ├── lib/           # API client + mock data
│   │   └── store/         # Zustand state management
│   ├── electron/         # Electron main process (desktop app)
│   ├── Dockerfile
│   └── package.json
│
├── backend/               # Python FastAPI
│   ├── api/routes/        # REST endpoints
│   ├── core/              # Autonomous agent logic
│   ├── models/            # Pydantic schemas
│   ├── services/          # Session management
│   ├── simulation/        # Network graph engine
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Option A: Run Locally (No Docker)

### Prerequisites
- Node.js 18+
- Python 3.11+

### Step 1 — Backend

```bash
cd aurora/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Step 2 — Frontend

Open a new terminal:

```bash
cd aurora/frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 🖥️ Option C: Run as desktop app (Electron)

Run AURORA in its own window like a native app.

### Prerequisites
- Node.js 18+
- (Optional) Python 3.11+ if you want the backend API; the app can run with mock data without it.

### One command

```bash
cd aurora/frontend
npm install
npm run electron:dev
```

This starts the Next.js dev server and opens an **Electron window** with the dashboard. The app will try to start the Python backend automatically if it’s available from the project root.

### Build a standalone app (macOS)

To create an **AURORA.app** you can double‑click:

```bash
cd aurora/frontend
npm run electron:pack
```

The app is written to `frontend/dist/`. Open **AURORA.app** from `dist/mac-arm64/` (or `dist/mac/` on Intel). The backend is not included in the .app; run it separately if you need the live API.

---

## 🐳 Option B: Run with Docker

### Prerequisites
- Docker Desktop installed and running

### One command to run everything:

```bash
cd aurora
docker-compose up --build
```

This starts both services:
- Frontend → http://localhost:3000
- Backend API → http://localhost:8000

### Stop everything:
```bash
docker-compose down
```

---

## 🖥️ Using the Dashboard

1. Open http://localhost:3000
2. Click **▶ Start Simulation**
3. Watch the autonomous agent:
   - Scan the network map
   - Identify vulnerabilities
   - Plan attack paths
   - Execute simulated exploit chain
   - Show reasoning in real time
4. Click any timeline event to expand details
5. Click **↺ Reset** to run again

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session/start` | Start a new simulation session |
| POST | `/api/session/{id}/step` | Advance one simulation step |
| GET | `/api/session/{id}` | Get full session state |
| GET | `/api/session/{id}/graph` | Get network graph |
| GET | `/api/session/{id}/metrics` | Get metrics data |
| GET | `/api/session/{id}/timeline` | Get event timeline |
| POST | `/api/session/{id}/replay` | Reset and replay |
| GET | `/api/sessions` | List all sessions |

Interactive docs: http://localhost:8000/docs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand |
| Backend | Python 3.11, FastAPI, Pydantic |
| Graph | NetworkX |
| Container | Docker + Docker Compose |

---

## ⚠️ Disclaimer

AURORA is a **safe simulation platform** for educational purposes.
- No real exploit payloads are generated
- No real network connections are made to external hosts
- No real credentials or vulnerabilities are targeted
- All CVE references are for educational context only
