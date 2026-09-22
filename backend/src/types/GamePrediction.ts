// src/types/GamePrediction.ts

export interface GamePrediction {
  gameId: string;
  modelName: string;
  prediction: string;
  confidence: number;
  ev: number;
  timestamp: string;

  teamA?: string;
  teamB?: string;

  scoreA?: number;
  scoreB?: number;

  predictedScoreA?: number;
  predictedScoreB?: number;

  script?: string;
}
