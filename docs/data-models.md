NFL Prediction Assistant — Data Models
Team Model
ts
interface Team {
id: number;
name: string;
offense: Stats;
defense: Stats;
}
Game Model
ts
interface Game {
id: number;
home: number;
away: number;
date: string;
}
Prediction Model
ts
interface Prediction {
winner: string;
confidence: number;
explanation: string;
}
