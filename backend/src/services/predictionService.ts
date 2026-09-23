import {
  fetchGameInfo,
  fetchModelScore,
  fetchOdds,
  fetchTeamStats,
  fetchHistoricalMatchup,
  fetchWeather,
  fetchInjuries,
  fetchBettingLines,
  fetchModelWeights
} from "./gameService";

export async function generatePrediction(gameId: string) {
  try {
    const gameInfo = await fetchGameInfo(gameId);
    if (!gameInfo) return { error: "Game not found" };

    const modelScore = await fetchModelScore(gameId);
    if (!modelScore) return { error: "Model score missing" };

    return {
      gameId,
      modelName: modelScore.modelName,
      prediction: modelScore.prediction,
      confidence: modelScore.confidence,
      ev: modelScore.ev,
      teamA: gameInfo.teamA,
      teamB: gameInfo.teamB,
      predictedScoreA: modelScore.predictedScoreA,
      predictedScoreB: modelScore.predictedScoreB,
      script: modelScore.script,
      odds: await fetchOdds(gameId),
      weather: await fetchWeather(gameId),
      injuries: await fetchInjuries(gameId),
      bettingLines: await fetchBettingLines(gameId),
      weights: await fetchModelWeights(),
      teamAStats: await fetchTeamStats(gameInfo.teamA),
      teamBStats: await fetchTeamStats(gameInfo.teamB),
      history: await fetchHistoricalMatchup(gameInfo.teamA, gameInfo.teamB)
    };
  } catch (err) {
    console.error("Prediction generation failed:", err);
    return { error: "Prediction generation failed" };
  }
}
