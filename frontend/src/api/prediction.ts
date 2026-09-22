import client from './client';

export interface GamePredictionResponse {
  winner: string;
  score: string;
  confidence: number;
  script: string;
  odds: {
    spread: { team: string; line: number; odds: number };
    total: { line: number; overOdds: number; underOdds: number };
    moneyline: { teamA: number; teamB: number };
  };
  ev: { ev: number; edge: string };
}

export async function predictGame(teamA: string, teamB: string): Promise<GamePredictionResponse> {
  const res = await client.post('/predict/game', { teamA, teamB });
  return res.data;
}

export async function getPerformance() {
  const res = await client.get('/performance');
  return res.data;
}
