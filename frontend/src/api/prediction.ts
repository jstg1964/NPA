import { apiGet } from "./client";

export async function generatePrediction(gameId: number) {
  const data = await apiGet(`/predict/${gameId}`);

  if (!data || Object.keys(data).length === 0) {
    throw new Error("Empty prediction response");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
