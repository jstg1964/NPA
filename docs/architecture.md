NFL Prediction Assistant — Architecture Overview

1. System Architecture
   The system is split into:

Frontend (React + TS + Vite)
Pages:

Home

Game List

Prediction View

Components:

GameList

GameRow

OddsInput

PredictionPanel

ModelExplanation

Backend (Node + Express)
Routes:

/games

/predict

/teams

Services:

predictionService.ts

statsService.ts

Prediction Engine
Pure TypeScript module

Inputs:

Team stats

Odds

Outputs:

Winner

Confidence

Explanation

Data Layer
Static JSON files:

teams.json

games.json

stats.json

Flow
User selects game

User enters odds

Frontend sends request to backend

Backend loads stats

Prediction engine runs

Response returned to frontend

UI displays results
