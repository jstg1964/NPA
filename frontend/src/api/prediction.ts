import type { Factors } from '../components/GamePredictionPanel';

export async function generatePrediction(
    gameId: number,
    factors: Factors,
    homeTeam?: string,
    awayTeam?: string,
) {
  const res = await fetch(`/api/predict/${gameId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...factors, homeTeam, awayTeam }),
  });

  if (!res.ok) throw new Error(`Prediction request failed: ${res.status}`);

  const data = await res.json();
  if (!data || Object.keys(data).length === 0) throw new Error('Empty prediction response');
  if (data.error) throw new Error(data.error);

  return data;
}
