NFL Prediction Assistant — API Documentation
Base URL
Code
http://localhost:3000
Endpoints
GET /games
Returns list of games.

Response:

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
