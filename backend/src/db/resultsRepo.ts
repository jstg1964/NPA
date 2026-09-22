import { connect } from './connection';

export async function saveModelResult(result: {
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
  context?: any;
  strength?: any;
  odds?: any;
  script?: string;
}) {
  const db = await connect();

  await db.run(
    `
    INSERT INTO model_results (
      gameId,
      modelName,
      prediction,
      confidence,
      ev,
      timestamp,
      teamA,
      teamB,
      scoreA,
      scoreB,
      context,
      strength,
      odds,
      script
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      result.gameId,
      result.modelName,
      result.prediction,
      result.confidence,
      result.ev,
      result.timestamp,
      result.teamA ?? null,
      result.teamB ?? null,
      result.scoreA ?? null,
      result.scoreB ?? null,
      JSON.stringify(result.context ?? null),
      JSON.stringify(result.strength ?? null),
      JSON.stringify(result.odds ?? null),
      result.script ?? null
    ]
  );
}

export async function getModelPerformance() {
  const db = await connect();

  const rows = await db.all(`
    SELECT modelName,
           COUNT(*) AS totalPredictions,
           AVG(ev) AS avgEV,
           AVG(confidence) AS avgConfidence
    FROM model_results
    GROUP BY modelName
  `);

  return rows;
}
