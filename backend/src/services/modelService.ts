// backend/src/services/modelService.ts

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

export async function runModel(gameId: string) {
  const gameInfo = await fetchGameInfo(gameId);
  const modelScore = await fetchModelScore(gameId);

  if (!gameInfo || !modelScore) {
    return null;
  }

  const odds = await fetchOdds(gameId);
  const weather = await fetchWeather(gameId);
  const injuries = await fetchInjuries(gameId);
  const bettingLines = await fetchBettingLines(gameId);
  const weights = await fetchModelWeights();

  const teamAStats = await fetchTeamStats(gameInfo.teamA);
  const teamBStats = await fetchTeamStats(gameInfo.teamB);

  const history = await fetchHistoricalMatchup(gameInfo.teamA, gameInfo.teamB);

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
