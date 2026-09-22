NFL Prediction Assistant — Deployment Guide
This guide explains how to deploy both the frontend and backend.

⭐ 1. Backend Deployment (Node + Express)
You can deploy the backend using:

Render

Railway

DigitalOcean

AWS EC2

Azure App Service

Below is the simplest method: Render.

1.1 Deploy Backend on Render
Step 1 — Create a new Web Service
Go to Render.com

Click New → Web Service

Select your GitHub repo

Step 2 — Configure
Code
Runtime: Node
Build Command: npm install
Start Command: npm run start
Step 3 — Environment Variables
Add any required variables (if needed).

Step 4 — Deploy
Render will auto-build and host your API.

1.2 Deploy Backend on Railway
Railway is similar:

Code
railway init
railway up
It auto-detects Node and deploys.

⭐ 2. Frontend Deployment (React + Vite)
You can deploy the frontend using:

Netlify

Vercel

GitHub Pages

Azure Static Web Apps

The easiest is Netlify.

2.1 Deploy Frontend on Netlify
Step 1 — Build the frontend
Code
npm run build
This creates:

Code
/dist
Step 2 — Deploy
Go to Netlify

Click New Site from Git

Select your repo

Step 3 — Configure
Code
Build Command: npm run build
Publish Directory: dist
Netlify will auto-deploy.

⭐ 3. Connecting Frontend to Backend
Once deployed:

Example:
Backend URL:

Code
https://nfl-api.onrender.com
Frontend .env:

Code
VITE_API_URL=https://nfl-api.onrender.com
Frontend service:

ts
axios.get(`${import.meta.env.VITE_API_URL}/games`)
⭐ 4. Production Checklist
Backend
Enable CORS

Use npm run start instead of dev

Add logging

Add error handling

Frontend
Minify build

Use environment variables

Test API connectivity

⭐ 5. Optional: Docker Deployment
Backend Dockerfile
dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
Frontend Dockerfile
dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]