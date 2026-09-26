export interface TeamPreset {
  abbrev:        string;
  fullName:      string;
  epa:           number;
  redZone:       number;
  playsPerGame:  number;
  pointsFor:     number;
  pointsAllowed: number;
  pressure:      number;
  momentum:      '3-0' | '2-1' | '1-2' | '0-3';
}

export async function fetchTeamPreset(abbrev: string, record = '0-0'): Promise<TeamPreset> {
  const url = `/api/team-stats/${abbrev}?record=${encodeURIComponent(record)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Team stats fetch failed: ${res.status}`);
  return res.json() as Promise<TeamPreset>;
}
