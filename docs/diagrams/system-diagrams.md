NFL Prediction Assistant — API Documentation
Base URL
Code
http://localhost:3000
Endpoints
GET /games
Returns list of games.

Response:
System Architecture Diagrams (Text-Based)
Since chat cannot embed actual diagram images, these are ASCII-style diagrams you can paste into Markdown or import into tools like Mermaid, Draw.io, or Lucidchart.

1. High-Level System Diagram
   Code
   +---------------------+ +---------------------+
   | React Frontend | <----> | Node/Express API |
   | (TypeScript/Vite) | | (Prediction API) |
   +---------------------+ +---------------------+
   | |
   | |
   v v
   +---------------------+ +---------------------+
   | Prediction Engine | | Static JSON Data |
   | (TypeScript) | | teams.json, stats |
   +---------------------+ +---------------------+
2. Frontend Component Hierarchy
   Code
   App
   ├── GameListPage
   │ ├── GameList
   │ │ └── GameRow
   │ └── NavigationBar
   │
   ├── PredictionPage
   │ ├── OddsInput
   │ ├── PredictionPanel
   │ └── ModelExplanation
   │
   └── SettingsPage (optional)
3. Backend Architecture Diagram
   Code
   Express Server
   ├── Routes
   │ ├── /games
   │ ├── /teams
   │ └── /predict
   │
   ├── Services
   │ ├── statsService
   │ └── predictionService
   │
   └── Data Layer
   ├── teams.json
   ├── games.json
   └── stats.json
4. Data Flow Diagram
   Code
   User Input → Frontend → Backend → Prediction Engine → Backend → Frontend → UI Output
   Detailed:

Code
[Odds Input]
↓
[POST /predict]
↓
[Load team stats]
↓
[Run prediction model]
↓
[Return JSON response]
↓
[Render PredictionPanel]
json
[
{
"id": 1,
"home": "Patriots",
"away": "Bills",
"spread": -3.5
}
]
POST /predict
Runs prediction.

Body:

json
{
"gameId": 1,
"spread": -3.5,
"moneyline": -120,
"total": 44.5
}
Response:

json
{
"winner": "Bills",
"confidence": 72,
"explanation": "Bills have stronger passing efficiency."
}
GET /teams
Returns team stats.
