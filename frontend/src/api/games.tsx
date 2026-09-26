import { apiGet } from './client';

export interface Game {
  id: string;
  teamA: string;
  teamB: string;
  teamAAbbrev: string;
  teamBAbbrev: string;
  teamALogo: string;
  teamBLogo: string;
  teamARecord: string;
  teamBRecord: string;
  teamAId: string;
  teamBId: string;
  venue: string;
  indoor: boolean;
  isDivisional?: boolean;
  gameTime: string;
  broadcast: string;
  spread: string | null;
  overUnder: number | null;
  weatherTemp: number | null;
  weatherDesc: string | null;
}

export interface TeamStats {
  epa: number;
  redZonePct: number;
  playsPerGame: number;
  pressureRate: number;
  pointsAllowed: number;
}

export interface GameStats {
  home: TeamStats;
  away: TeamStats;
  homeH2HWins: number;
  awayH2HWins: number;
}

export async function fetchGames(week: number): Promise<Game[]> {
  return apiGet(`/games?week=${week}`);
}

export async function fetchGameStats(gameId: string): Promise<GameStats> {
  return apiGet(`/stats/${gameId}`);
}
