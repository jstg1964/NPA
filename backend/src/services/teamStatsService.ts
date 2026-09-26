import axios from 'axios';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
const SEASON    = new Date().getFullYear();

export interface TeamPreset {
  abbrev:        string;
  fullName:      string;
  epa:           number;
  redZone:       number;
  playsPerGame:  number;
  pointsAllowed: number;
  pointsFor:     number;
  pressure:      number;
  momentum:      '3-0' | '2-1' | '1-2' | '0-3';
}

// Cache so we don't hammer ESPN on every game click
const cache = new Map<string, { data: TeamPreset; ts: number }>();
const TTL   = 10 * 60 * 1000;

// Get all team IDs once
let teamIdMap: Map<string, string> | null = null;
async function getTeamIdMap(): Promise<Map<string, string>> {
  if (teamIdMap) return teamIdMap;
  const { data } = await axios.get(`${ESPN_BASE}/teams`, { params: { limit: 32 }, timeout: 6000 });
  teamIdMap = new Map<string, string>();
  for (const item of data?.sports?.[0]?.leagues?.[0]?.teams ?? []) {
    const t = item.team;
    teamIdMap.set(t.abbreviation.toUpperCase(), t.id);
  }
  return teamIdMap;
}

function findStat(categories: any[], statName: string): number | null {
  for (const cat of categories ?? []) {
    for (const s of cat.stats ?? []) {
      if (s.name?.toLowerCase() === statName.toLowerCase()) {
        return parseFloat(s.perGameValue ?? s.value ?? s.displayValue ?? '');
      }
    }
  }
  return null;
}

function recordToMomentum(record: string): '3-0' | '2-1' | '1-2' | '0-3' {
  const [w, l] = record.split('-').map(Number);
  const wins = w ?? 0, losses = l ?? 0;
  const total = wins + losses;
  if (total === 0) return '1-2';
  const pct = wins / total;
  if (pct >= 0.9) return '3-0';
  if (pct >= 0.6) return '2-1';
  if (pct >= 0.3) return '1-2';
  return '0-3';
}

export async function fetchTeamPreset(abbrev: string, record = '0-0'): Promise<TeamPreset> {
  const key = abbrev.toUpperCase();
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < TTL) return hit.data;

  try {
    const idMap = await getTeamIdMap();
    const teamId = idMap.get(key);
    if (!teamId) throw new Error(`Unknown team abbreviation: ${key}`);

    const { data } = await axios.get(`${ESPN_BASE}/teams/${teamId}/statistics`, {
      params:  { season: SEASON, seasontype: 2 },
      timeout: 6000,
    });

    const cats       = data?.results?.categories ?? data?.splits?.categories ?? [];
    const fullName   = data?.team?.displayName   ?? abbrev;

    // Pull stats — try multiple possible ESPN field names
    const playsRaw   = findStat(cats, 'plays')           ?? findStat(cats, 'totalPlays')   ?? 63;
    const rzRaw      = findStat(cats, 'redZonePct')       ?? findStat(cats, 'redZoneScoringPct') ?? 57;
    const ptsFRaw    = findStat(cats, 'pointsPerGame')    ?? findStat(cats, 'points')       ?? 23;
    const ptsARaw    = findStat(cats, 'pointsAllowed')    ?? findStat(cats, 'oppPointsPerGame') ?? 23;
    const yardsPlay  = findStat(cats, 'yardsPerPlay')     ?? findStat(cats, 'totalYardsPerPlay') ?? 5.2;

    // Derive EPA proxy from yards/play (ESPN doesn't expose EPA directly)
    const epa        = Math.round(((yardsPlay - 5.2) * 0.05) * 100) / 100;

    // Pressure rate: ESPN sometimes has sack rate; use 27.5 default if missing
    const sackRate   = findStat(cats, 'sackYardsPerGame') ?? null;
    const pressure   = sackRate !== null ? Math.min(45, Math.max(15, sackRate * 3.5 + 20)) : 27.5;

    const preset: TeamPreset = {
      abbrev:        key,
      fullName,
      epa:           Math.max(-0.3, Math.min(0.3, epa)),
      redZone:       Math.max(0,    Math.min(100, rzRaw)),
      playsPerGame:  Math.max(45,   Math.min(85,  playsRaw)),
      pointsFor:     Math.round(ptsFRaw * 10) / 10,
      pointsAllowed: Math.round(ptsARaw * 10) / 10,
      pressure:      Math.round(pressure * 10) / 10,
      momentum:      recordToMomentum(record),
    };

    cache.set(key, { data: preset, ts: now });
    return preset;

  } catch (err: any) {
    console.warn(`[teamStatsService] Could not fetch stats for ${key}:`, err.message);
    // Return sensible defaults so the panel still loads
    return {
      abbrev:        key,
      fullName:      abbrev,
      epa:           0.0,
      redZone:       57,
      playsPerGame:  63,
      pointsFor:     23,
      pointsAllowed: 23,
      pressure:      27.5,
      momentum:      recordToMomentum(record),
    };
  }
}
