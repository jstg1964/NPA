import type { GameFactors } from '../components/GamePredictionPanel';

export async function generatePrediction(gameId: number, _factors: GameFactors) {
  const res = await fetch(`/api/predict/${gameId}`);

  if (!res.ok) throw new Error(`Prediction request failed: ${res.status}`);

  const data = await res.json();

  if (!data || Object.keys(data).length === 0) throw new Error('Empty prediction response');
  if (data.error) throw new Error(data.error);

  return data;
}
