NFL Prediction Assistant
A full-stack application that predicts NFL game outcomes using custom statistical models, team efficiency metrics, and user-provided betting odds.

⭐ Features
Game listing with spreads, totals, and moneylines

Custom prediction engine (TypeScript)

Confidence scoring

Model explanation output

React + TypeScript + Vite frontend

Node + Express backend

Static JSON data for teams and games

⭐ Tech Stack
Frontend
React

TypeScript

Vite

Axios

Backend
Node.js

Express

TypeScript

Data
teams.json

games.json

stats.json

⭐ Project Structure
Code
/frontend
/src
/components
/pages
/services

/backend
/src
/routes
/services
/prediction
/data

/docs
(all documentation files)
⭐ Running the Project
Backend
Code
cd backend
npm install
npm run dev
Backend runs at:

Code
http://localhost:3000
Frontend
Code
cd frontend
npm install
npm run dev
Frontend runs at:

Code
http://localhost:5173
⭐ API Endpoints
GET /games
Returns list of games.

GET /teams
Returns team stats.

POST /predict
Runs prediction model.

⭐ Prediction Engine Overview
Inputs:

Team stats

Spread

Moneyline

Total

Outputs:

Winner

Confidence score

Explanation

See /docs/prediction-engine-math.md for full math breakdown.

⭐ Deployment
See /docs/deployment-guide.md.

⭐ License
MIT License.