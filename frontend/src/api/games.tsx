import { apiGet } from "./client";

export interface Game {
  id: number;
  teamA: string;
  teamB: string;
  date: string;
}

export async function fetchGames(): Promise<Game[]> {
  return apiGet("/games");
}
