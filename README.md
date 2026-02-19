# aurora.

### Autonomous Red Team Simulation Agent

AURORA is a controlled red-team simulation platform built for education,
experimentation, and portfolio demonstration.

It does **not** attack real systems.\
It does **not** connect to external networks.\
All data is synthetic by design.

This project focuses on autonomous decision-making, attack path
modeling, and visual simulation --- inside a completely safe sandbox.

------------------------------------------------------------------------

## 🧠 What AURORA Does

When you start a session, the agent will:

-   Scan a synthetic network graph
-   Identify simulated vulnerabilities
-   Plan possible attack paths
-   Execute a mock exploit chain
-   Log reasoning step-by-step
-   Track metrics and timeline events

You can inspect every step, replay sessions, reset simulations, and
explore the evolving network state.

No real payloads.\
No real credentials.\
No real infrastructure.

------------------------------------------------------------------------

## 📁 Project Structure

    aurora/
    ├── frontend/
    │   ├── src/
    │   │   ├── app/           # Next.js app router
    │   │   ├── components/    # UI components
    │   │   ├── lib/           # API client + mock data
    │   │   └── store/         # Zustand state management
    │   ├── electron/          # Electron desktop wrapper
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── backend/
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

------------------------------------------------------------------------

# 🚀 Running AURORA

You have three ways to run the platform.

------------------------------------------------------------------------

## Option A --- Local Development (No Docker)

### Requirements

-   Node.js 18+
-   Python 3.11+

### 1️⃣ Start Backend

``` bash
cd aurora/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend: - http://localhost:8000\
- API Docs: http://localhost:8000/docs

------------------------------------------------------------------------

### 2️⃣ Start Frontend (New Terminal)

``` bash
cd aurora/frontend
npm install
npm run dev
```

Frontend: - http://localhost:3000

------------------------------------------------------------------------

## Option B --- Docker (Everything Together)

### Requirement

-   Docker Desktop installed and running

From project root:

``` bash
cd aurora
docker-compose up --build
```

Services: - Frontend → http://localhost:3000\
- Backend → http://localhost:8000

To stop:

``` bash
docker-compose down
```

------------------------------------------------------------------------

## Option C --- Desktop Mode (Electron)

Run AURORA as a native desktop app.

### Dev Mode

``` bash
cd aurora/frontend
npm install
npm run electron:dev
```

This: - Starts the Next.js dev server - Opens an Electron window -
Attempts to start the backend automatically (if available)

The app can run with mock data only if the backend is not active.

------------------------------------------------------------------------

### Build macOS App

``` bash
cd aurora/frontend
npm run electron:pack
```

Output location:

    frontend/dist/

Open: - `dist/mac-arm64/AURORA.app` (Apple Silicon) -
`dist/mac/AURORA.app` (Intel)

Note: The backend is not bundled inside the `.app`. Run it separately if
you need live API support.

------------------------------------------------------------------------

# 🖥️ Using the Dashboard

1.  Open http://localhost:3000\
2.  Click **Start Simulation**
3.  Observe the agent:
    -   Map the network
    -   Detect vulnerabilities
    -   Build an attack chain
    -   Execute simulated actions
    -   Log reasoning in real time
4.  Click timeline events for detailed inspection
5.  Click **Reset** to replay

------------------------------------------------------------------------

# 🔌 API Endpoints

Base URL:

    http://localhost:8000

  Method   Endpoint                       Description
  -------- ------------------------------ ------------------------------
  POST     `/api/session/start`           Start new simulation session
  POST     `/api/session/{id}/step`       Advance one step
  GET      `/api/session/{id}`            Get full session state
  GET      `/api/session/{id}/graph`      Retrieve network graph
  GET      `/api/session/{id}/metrics`    Retrieve metrics
  GET      `/api/session/{id}/timeline`   Retrieve timeline
  POST     `/api/session/{id}/replay`     Reset and replay session
  GET      `/api/sessions`                List sessions

Interactive API docs:

    http://localhost:8000/docs

------------------------------------------------------------------------

# 🛠 Tech Stack

### Frontend

-   Next.js 14
-   TypeScript
-   TailwindCSS
-   Zustand
-   Framer Motion
-   Recharts

### Backend

-   Python 3.11
-   FastAPI
-   Pydantic
-   NetworkX

### Infrastructure

-   Docker
-   Docker Compose

------------------------------------------------------------------------

# ⚠️ Safety Notice

AURORA is a **safe simulation environment**.

-   No real exploit payloads are generated
-   No external network connections are made
-   No real credentials are used
-   CVE references are educational only

This project demonstrates: - Autonomous agent behavior - Simulation
modeling - Graph-based reasoning - System architecture - Visualization
of attack paths

It is not an offensive security tool.

------------------------------------------------------------------------

**AURORA --- controlled chaos in a safe sandbox.**
