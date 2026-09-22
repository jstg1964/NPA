# NFL Betting Assistant

Monorepo: Node + Express + TypeScript + SQLite + WebSockets (backend) and Vite + React + TypeScript + Tailwind (frontend).

## Project Structure

This monorepo contains both the backend API and the frontend web application.

### backend/
Node + Express + TypeScript + SQLite + socket.io  
Strict mode enabled  
Mock/real data switch via `USE_MOCK` environment variable  

Features:
- Game prediction API
- EV engine
- Script generator
- SQLite storage
- Auto‑logging of predictions
- Historical model performance tracking
- WebSocket alerts + real‑time updates
- Mock data (default) or real API integrations

### frontend/
Vite + React + TypeScript + Tailwind + socket.io‑client  

Features:
- Team selector
- Game prediction panel
- Value/EV panel
- Alerts panel (real‑time)
- Performance dashboard
- Fully styled Tailwind UI
- Real‑time WebSocket updates

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# From repo root
cd backend
npm install

cd ../frontend
npm install
