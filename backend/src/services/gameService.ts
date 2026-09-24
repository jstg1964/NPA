import axios from 'axios';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
const SEASON    = new Date().getFullYear();

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface GameInfo {
  teamA: string;
  teamB: string;
}

export interface WeatherInfo {
  temp:          number;
  wind:          number;
  precipitation: number;
}

export interface InjuryInfo {
  player: string;
  status: string;
}

// ─── Per-week cache ───────────────────────────────────────────────────────────

const weekCache = new Map<number, { games: Game[]; time: number }>();
const CACHE_TTL  = 5 * 60 * 1000;

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseGames(data: any): Game[] {
  const games: Game[] = [];

  for (const event of data.events ?? []) {
    const competition = event.competitions?.[0];
    if (!competition) continue;

    const home = competition.competitors?.find((c: any) => c.homeAway === 'home');
    const away = competition.competitors?.find((c: any) => c.homeAway === 'away');
    if (!home || !away) continue;

    const homeRecord  = home.records?.find((r: any) => r.type === 'total')?.summary ?? '';
    const awayRecord  = away.records?.find((r: any) => r.type === 'total')?.summary ?? '';
    const odds        = competition.odds?.[0] ?? null;
    const weather     = competition.weather  ?? null;
    const broadcast   = competition.broadcasts?.[0]?.names?.[0] ?? event.broadcast ?? '';

    games.push({
      id:          Number(event.id),
      teamA:       home.team.displayName,
      teamB:       away.team.displayName,
      teamAAbbrev: home.team.abbreviation,
      teamBAbbrev: away.team.abbreviation,
      teamALogo:   home.team.logo ?? '',
      teamBLogo:   away.team.logo ?? '',
      teamARecord: homeRecord,
      teamBRecord: awayRecord,
      venue:       competition.venue?.fullName ?? '',
      indoor:      competition.venue?.indoor   ?? false,
      gameTime:    event.status?.type?.detail  ?? event.date ?? '',
      broadcast,
      spread:      odds?.details   ?? null,
      overUnder:   odds?.overUnder ?? null,
      weatherTemp: weather?.temperature  ?? null,
      weatherDesc: weather?.displayValue ?? null,
    });
  }

  return games;
}

// ─── Public: fetch by week ────────────────────────────────────────────────────

export async function getAllGames(week: number): Promise<Game[]> {
  const now    = Date.now();
  const cached = weekCache.get(week);
  if (cached && now - cached.time < CACHE_TTL) return cached.games;

  try {
    const { data } = await axios.get(`${ESPN_BASE}/scoreboard`, {
      params: { dates: SEASON, seasontype: 2, week },
      timeout: 8000,
    });
    const games = parseGames(data);
    weekCache.set(week, { games, time: now });
    return games;
  } catch (err: any) {
    console.error(`[gameService] ESPN fetch failed (week ${week}):`, err.message);
    return cached?.games ?? [];
  }
}

// ─── Internal: search all cached weeks by game ID ────────────────────────────

function findCachedGame(gameId: number): Game | null {
  for (const entry of weekCache.values()) {
    const match = entry.games.find(g => g.id === gameId);
    if (match) return match;
  }
  return null;
}

// ─── Public: lookup helpers (no week needed — search cache) ──────────────────

export async function fetchGameInfo(gameId: string): Promise<GameInfo | null> {
  const id   = Number(gameId);
  const game = findCachedGame(id);
  if (game) return { teamA: game.teamA, teamB: game.teamB };

  // Cache miss — try current week as fallback
  await getAllGames(3);
  const fallback = findCachedGame(id);
  return fallback ? { teamA: fallback.teamA, teamB: fallback.teamB } : null;
}

export async function fetchWeather(gameId: string): Promise<WeatherInfo | null> {
  const id   = Number(gameId);
  const game = findCachedGame(id) ?? await getAllGames(3).then(() => findCachedGame(id));
  if (!game || game.indoor) return null;
  return {
    temp:          game.weatherTemp ?? 65,
    wind:          8,
    precipitation: 0,
  };
}

export async function fetchInjuries(_gameId: string): Promise<InjuryInfo[]> {
  return [];
}
