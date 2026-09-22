// backend/src/services/predictionService.ts

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
  // Load all data sources
  const gameInfo = await fetchGameInfo(gameId);
  const modelScore = await fetchModelScore(gameId);
  const odds = await fetchOdds(gameId);
  const weather = await fetchWeather(gameId);
  const injuries = await fetchInjuries(gameId);
  const bettingLines = await fetchBettingLines(gameId);
  const weights = await fetchModelWeights();

  if (!gameInfo || !modelScore) {
    return null;
  }

  // Team stats
  const teamAStats = await fetchTeamStats(gameInfo.teamA);
  const teamBStats = await fetchTeamStats(gameInfo.teamB);

  // Historical matchup
  const history = await fetchHistoricalMatchup(gameInfo.teamA, gameInfo.teamB);

  // Build final prediction object
  return {
    modelName: modelScore.modelName,
    prediction: modelScore.prediction,
    confidence: modelScore.confidence,
    ev: modelScore.ev,
    teamA: gameInfo.teamA,
    teamB: gameInfo.teamB,
    predictedScoreA: modelScore.predictedScoreA,
    predictedScoreB: modelScore.predictedScoreB,
    script: modelScore.script,

    // Extra data for future UI expansion
    odds,
    weather,
    injuries,
    bettingLines,
    weights,
    teamAStats,
    teamBStats,
    history
  };
}
