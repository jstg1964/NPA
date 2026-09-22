NFL Prediction Assistant — Functional Specification

1. Purpose
   The NFL Prediction Assistant provides game predictions, confidence scores, and model explanations based on team stats, odds, and custom logic. It helps users evaluate betting opportunities using structured, transparent data.

2. Scope
   The system includes:

A React + TypeScript + Vite frontend

A Node + Express backend

A custom JS/TS prediction engine

Static JSON data for teams, games, and stats

Manual odds input

Real-time prediction output

3. Users
   General users: View predictions

Analysts: Adjust odds, inspect model explanations

Developers: Extend prediction logic

4. Core Features
   Game listing

Odds input

Prediction engine

Confidence scoring

Model explanation

Team stats display

API endpoints for predictions and game data

5. Functional Requirements
   5.1 Game Listing
   Display all upcoming games

Show teams, spread, moneyline, totals

Allow selecting a game

5.2 Odds Input
User enters:

Spread

Moneyline

Over/Under

Validation ensures numeric input

5.3 Prediction Engine
Accepts:

Team stats

Odds

Historical performance

Produces:

Winner prediction

Confidence score (0–100%)

Explanation text

5.4 API Requirements
GET /games

POST /predict

GET /teams

5.5 Error Handling
Invalid odds

Missing game data

Backend unavailable

6. Non-Functional Requirements
   Fast response (<150ms backend)

Clear UI

Maintainable code

Modular prediction logic
