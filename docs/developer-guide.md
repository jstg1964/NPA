NFL Prediction Assistant — Developer Guide

1. Setup
   Frontend
   Code
   cd frontend
   npm install
   npm run dev
   Backend
   Code
   cd backend
   npm install
   npm run dev
2. Folder Structure
   Frontend
   Code
   src/
   components/
   pages/
   hooks/
   services/
   Backend
   Code
   src/
   routes/
   services/
   data/
   prediction/
3. Adding New Features
   Add new components under /components

Add new routes under /routes

Extend prediction logic in /prediction

4. Deployment
   Vite build → static assets

Node backend deployed separately
