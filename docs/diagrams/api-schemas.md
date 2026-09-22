API Schemas (TypeScript + JSON)
Game Schema
ts
interface Game {
id: number;
homeTeamId: number;
awayTeamId: number;
date: string;
spread: number;
moneyline: number;
total: number;
}
Team Schema
ts
interface Team {
id: number;
name: string;
offense: TeamStats;
defense: TeamStats;
}
TeamStats Schema
ts
interface TeamStats {
passYards: number;
rushYards: number;
pointsPerGame: number;
turnovers: number;
efficiency: number;
}
Prediction Request Schema
json
{
"gameId": 12,
"spread": -3.5,
"moneyline": -120,
"total": 44.5
}
Prediction Response Schema
json
{
"winner": "Bills",
"confidence": 72,
"scorePrediction": "27-20",
"explanation": "Bills passing efficiency is significantly higher."
}
