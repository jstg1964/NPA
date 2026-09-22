// backend/src/services/gameService.ts

import {
  getMockGames,
  getMockGameInfo,
  getMockModelScore,
  getMockOdds,
  getMockTeamStats,
  getMockHistoricalMatchup,
  getMockWeather,
  getMockInjuries,
  getMockBettingLines,
  getMockModelWeights
} from "../data/mockDataService";

export async function getAllGames() {
  return getMockGames();
}

export async function fetchGameInfo(gameId: string) {
  return getMockGameInfo(gameId);
}

export async function fetchModelScore(gameId: string) {
  return getMockModelScore(gameId);
}

export async function fetchOdds(gameId: string) {
  return getMockOdds(gameId);
}

export async function fetchTeamStats(team: string) {
  return getMockTeamStats(team);
}

export async function fetchHistoricalMatchup(teamA: string, teamB: string) {
  return getMockHistoricalMatchup(teamA, teamB);
}

export async function fetchWeather(gameId: string) {
  return getMockWeather(gameId);
}

export async function fetchInjuries(gameId: string) {
  return getMockInjuries(gameId);
}

export async function fetchBettingLines(gameId: string) {
  return getMockBettingLines(gameId);
}

export async function fetchModelWeights() {
  return getMockModelWeights();
}
