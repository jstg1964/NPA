import { apiGet } from './client';

export interface Game {
  id:            number;
  teamA:         string;
  teamB:         string;
  teamAAbbrev:   string;
  teamBAbbrev:   string;
  teamALogo:     string;
  teamBLogo:     string;
  teamARecord:   string;
  teamBRecord:   string;
  venue:         string;
  indoor:        boolean;
  gameTime:      string;
  broadcast:     string;
  spread:        string | null;
  overUnder:     number | null;
  weatherTemp:   number | null;
  weatherDesc:   string | null;
}

export async function fetchGames(week: number): Promise<Game[]> {
  return apiGet(`/games?week=${week}`);
}
