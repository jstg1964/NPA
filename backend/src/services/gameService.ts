import axios from 'axios';

const ESPN_NFL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  gameTime: string;
  broadcast: string;
  spread: string;
  overUnder: number;
  weatherTemp: number;
  weatherDesc: string;
  homeWinPct: number;
  awayWinPct: number;
  vegasSpread: string;
  homeMoneyLine: number;
  awayMoneyLine: number;
}

// Required by predictionService
export interface GameInfo    { teamA: string; teamB: string; }
export interface WeatherInfo { temp: number; wind: number; precipitation: number; }
export interface InjuryInfo  { player: string; status: string; }

// ─── In-memory cache ──────────────────────────────────────────────────────────

const gameCache = new Map<string, Game>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statVal(categories: any[], name: string): number {
  for (const cat of categories) {
    const s = (cat.stats ?? []).find((x: any) => x.name === name);
    if (s !== undefined) return parseFloat(s.displayValue) || 0;
  }
  return 0;
}

function parseWins(summary: string): number {
  const wins = parseInt((summary ?? '0-0').split('-')[0], 10);
  return isNaN(wins) ? 0 : wins;
}

function winPctFromRecord(summary: string): number {
  const parts = (summary ?? '0-0').split('-').map(Number);
  const w = parts[0] || 0;
  const l = parts[1] || 0;
  const total = w + l;
  return total > 0 ? w / total : 0.5;
}

// ─── ESPN API helpers ─────────────────────────────────────────────────────────

async function fetchTeamStats(teamId: string): Promise<TeamStats> {
  try {
    const { data } = await axios.get(`${ESPN_NFL}/teams/${teamId}/statistics`);
    const cats: any[]    = data?.results?.stats?.categories ?? [];
    const oppCats: any[] = data?.results?.opponent          ?? [];

    const playsTotal  = statVal(cats, 'totalOffensivePlays');
    const gamesPlayed = statVal(cats, 'teamGamesPlayed') || 1;

    return {
      epa:           statVal(cats, 'yardsPerPassAttempt'),
      redZonePct:    statVal(cats, 'redzoneScoringPct'),
      playsPerGame:  Math.round((playsTotal / gamesPlayed) * 10) / 10,
      pressureRate:  statVal(cats, 'sacks'),
      pointsAllowed: statVal(oppCats, 'totalPointsPerGame'),
    };
  } catch (err) {
    console.error(`[gameService] fetchTeamStats(${teamId}) failed:`, (err as Error).message);
    return { epa: 0, redZonePct: 0, playsPerGame: 0, pressureRate: 0, pointsAllowed: 0 };
  }
}

async function fetchSummaryCompetitors(gameId: string): Promise<{
  homeId: string; awayId: string; homeWins: number; awayWins: number;
  teamA: string; teamB: string;
  weatherTemp: number; weatherDesc: string; indoor: boolean;
}> {
  const fallback = {
    homeId: '', awayId: '', homeWins: 0, awayWins: 0,
    teamA: 'Home', teamB: 'Away',
    weatherTemp: 72, weatherDesc: 'Clear', indoor: false,
  };
  try {
    const { data } = await axios.get(`${ESPN_NFL}/summary?event=${gameId}`);
    const comp = data?.header?.competitions?.[0];
    const competitors: any[] = comp?.competitors ?? [];

    let homeId = '', awayId = '', homeWins = 0, awayWins = 0;
    let teamA = 'Away', teamB = 'Home';

    for (const c of competitors) {
      const totalRec = (c.records ?? []).find((r: any) => r.type === 'total');
      const wins     = parseWins(totalRec?.summary ?? '0-0');
      if (c.homeAway === 'home') {
        homeId = c.team?.id ?? '';
        teamB  = c.team?.displayName ?? 'Home';
        homeWins = wins;
      } else {
        awayId = c.team?.id ?? '';
        teamA  = c.team?.displayName ?? 'Away';
        awayWins = wins;
      }
    }

    const weather = data?.gameInfo?.weather ?? null;

    return {
      homeId, awayId, homeWins, awayWins, teamA, teamB,
      weatherTemp: weather?.temperature  ?? 72,
      weatherDesc: weather?.displayValue ?? 'Clear',
      indoor:      comp?.venue?.indoor   ?? false,
    };
  } catch (err) {
    console.error(`[gameService] fetchSummaryCompetitors(${gameId}) failed:`, (err as Error).message);
    return fallback;
  }
}

// ─── Public: game list ────────────────────────────────────────────────────────

export async function fetchGames(week: number): Promise<Game[]> {
  const year = new Date().getFullYear();
  const { data } = await axios.get(
      `${ESPN_NFL}/scoreboard?dates=${year}&seasontype=2&week=${week}`
  );
  const events: any[] = data?.events ?? [];

  const games = events.map((event: any) => {
    const comp        = event.competitions?.[0];
    if (!comp) return null;
    const competitors = comp.competitors ?? [];
    const home        = competitors.find((c: any) => c.homeAway === 'home') ?? competitors[0];
    const away        = competitors.find((c: any) => c.homeAway === 'away') ?? competitors[1];
    if (!home || !away) return null;

    const getRecord = (c: any) =>
        (c.records ?? []).find((r: any) => r.type === 'total')?.summary ?? '0-0';

    const odds  = comp.odds?.[0] ?? {};
    const venue = comp.venue;

    const game: Game = {
      id:            event.id,
      teamA:         away.team?.displayName   ?? '',
      teamB:         home.team?.displayName   ?? '',
      teamAAbbrev:   away.team?.abbreviation  ?? '',
      teamBAbbrev:   home.team?.abbreviation  ?? '',
      teamALogo:     away.team?.logo          ?? '',
      teamBLogo:     home.team?.logo          ?? '',
      teamARecord:   getRecord(away),
      teamBRecord:   getRecord(home),
      teamAId:       away.team?.id            ?? '',
      teamBId:       home.team?.id            ?? '',
      venue:         venue?.fullName          ?? 'TBD',
      indoor:        venue?.indoor            ?? false,
      gameTime:      event.date               ?? '',
      broadcast:     comp.broadcasts?.[0]?.names?.[0] ?? '',
      spread:        odds.details             ?? 'N/A',
      overUnder:     odds.overUnder           ?? 0,
      weatherTemp:   comp.weather?.temperature  ?? 72,
      weatherDesc:   comp.weather?.displayValue ?? 'Clear',
      homeWinPct:    winPctFromRecord(getRecord(home)),
      awayWinPct:    winPctFromRecord(getRecord(away)),
      vegasSpread:   odds.details             ?? 'N/A',
      homeMoneyLine: odds.homeTeamOdds?.moneyLine ?? 0,
      awayMoneyLine: odds.awayTeamOdds?.moneyLine ?? 0,
    };

    // Cache for later lookups by predictionService
    gameCache.set(event.id, game);
    return game;
  });

  return games.filter(Boolean) as Game[];
}

// ─── Public: per-game stats (used by /stats/:gameId route) ───────────────────

export async function fetchGameStats(
    gameId: string,
    homeTeamId?: string,
    awayTeamId?: string
): Promise<GameStats> {
  const summary = await fetchSummaryCompetitors(gameId);

  const resolvedHomeId = homeTeamId || summary.homeId;
  const resolvedAwayId = awayTeamId || summary.awayId;

  const empty: TeamStats = { epa: 0, redZonePct: 0, playsPerGame: 0, pressureRate: 0, pointsAllowed: 0 };

  const [homeStats, awayStats] = await Promise.all([
    resolvedHomeId ? fetchTeamStats(resolvedHomeId) : Promise.resolve(empty),
    resolvedAwayId ? fetchTeamStats(resolvedAwayId) : Promise.resolve(empty),
  ]);

  return {
    home:        homeStats,
    away:        awayStats,
    homeH2HWins: summary.homeWins,
    awayH2HWins: summary.awayWins,
  };
}

// ─── Public: used by predictionService ───────────────────────────────────────

export async function fetchGameInfo(gameId: string): Promise<GameInfo | null> {
  // Check in-memory cache first (populated by fetchGames)
  const cached = gameCache.get(gameId);
  if (cached) return { teamA: cached.teamA, teamB: cached.teamB };

  // Fall back to summary endpoint
  try {
    const s = await fetchSummaryCompetitors(gameId);
    return s.teamA && s.teamB ? { teamA: s.teamA, teamB: s.teamB } : null;
  } catch {
    return null;
  }
}

export async function fetchWeather(gameId: string): Promise<WeatherInfo | null> {
  const cached = gameCache.get(gameId);
  if (cached) {
    if (cached.indoor) return null;
    return { temp: cached.weatherTemp, wind: 8, precipitation: 0 };
  }

  try {
    const s = await fetchSummaryCompetitors(gameId);
    if (s.indoor) return null;
    return { temp: s.weatherTemp, wind: 8, precipitation: 0 };
  } catch {
    return null;
  }
}

export async function fetchInjuries(_gameId: string): Promise<InjuryInfo[]> {
  // ESPN public API does not expose injury data — return empty list
  return [];
}
// Alias kept for backwards-compat with oddsService and any other callers
export const getAllGames = fetchGames;
