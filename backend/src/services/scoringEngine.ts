export type PrecipitationType = 'none' | 'light' | 'heavy' | 'snow' | 'blizzard';

export interface GameFactors {
  homeEPA: number;
  awayEPA: number;
  homeRedZone: number;        // 0–100, 0% now fully allowed
  awayRedZone: number;
  homePressure: number;
  awayPressure: number;
  homePointsAllowed: number;
  awayPointsAllowed: number;
  homePlays: number;
  awayPlays: number;
  homeMomentum: '3-0' | '2-1' | '1-2' | '0-3';
  awayMomentum: '3-0' | '2-1' | '1-2' | '0-3';
  stadiumType: 'outdoor' | 'dome' | 'neutral';
  temp: number;
  wind: number;
  precipitation: PrecipitationType;
  homeInjuryImpact: number;
  awayInjuryImpact: number;
  homeH2HWins: number;
  awayH2HWins: number;
  isDivisional: boolean;
}

export interface PredictionResult {
  homeScore: number;
  awayScore: number;
  homeWinPct: number;
  awayWinPct: number;
  tiesPct: number;
  confidence: number;
  confidenceLabel: string;
  topScores: Array<{ home: number; away: number; pct: number }>;
  breakdown: Array<{ label: string; homeEdge: number }>;
}

const LEAGUE_AVG_PPG     = 23.0;
const LEAGUE_AVG_EPA     = 0.0;
const LEAGUE_AVG_RZ      = 58.0;
const LEAGUE_AVG_PLAYS   = 66.0;
const LEAGUE_AVG_PA      = 23.0;
const LEAGUE_AVG_PRESS   = 27.5;

const momentumMap: Record<string, number> = {
  '3-0': 1.5, '2-1': 0.5, '1-2': -0.5, '0-3': -1.5,
};

function weatherPenalty(f: GameFactors): number {
  if (f.stadiumType === 'dome') return 0;
  let pen = 0;
  if (f.wind > 20)         pen += (f.wind - 20) * 0.15;
  if (f.temp < 25)         pen += (25 - f.temp) * 0.08;
  if (f.temp > 95)         pen += (f.temp - 95) * 0.06;
  const precipPen: Record<PrecipitationType, number> = {
    none: 0, light: 0.5, heavy: 2.0, snow: 3.5, blizzard: 6.0,
  };
  pen += precipPen[f.precipitation] ?? 0;
  return pen;
}

function calcScore(
    epa: number,
    redZone: number,
    plays: number,
    pressure: number,       // opponent's pressure rate
    pointsAllowed: number,  // opponent's points allowed
    momentum: string,
    injuryImpact: number,
    h2hEdge: number,
    isHome: boolean,
    wxPenalty: number,
    isDivisional: boolean,
): number {
  let score = LEAGUE_AVG_PPG;

  // EPA
  score += (epa - LEAGUE_AVG_EPA) * 27;

  // Defense faced (opponent stats)
  const pressurePen = (pressure - LEAGUE_AVG_PRESS) * 0.15;
  const defBlend    = (pointsAllowed * 0.6) + (LEAGUE_AVG_PA * 0.4);
  score -= pressurePen;
  score  = score * 0.5 + defBlend * 0.5;

  // Red zone — ADDITIVE (was multiplicative, now allows 0%)
  // League avg (58%) = 0 adjustment. 0% = -14.5 pts. 80% = +5.5 pts.
  score += (redZone - LEAGUE_AVG_RZ) * 0.25;

  // Pace
  score *= plays / LEAGUE_AVG_PLAYS;

  // Home field
  if (isHome) score += 2.5;

  // Weather
  score -= wxPenalty;

  // Injuries
  score -= injuryImpact;

  // Momentum
  score += momentumMap[momentum] ?? 0;

  // H2H edge (small)
  score += h2hEdge * 0.5;

  // Divisional tightening
  if (isDivisional) score *= 0.96;

  return Math.min(52, Math.max(3, score));
}

export function predictGame(f: GameFactors): { homeScore: number; awayScore: number } {
  const wx      = weatherPenalty(f);
  const totalH2H = f.homeH2HWins + f.awayH2HWins || 1;
  const homeH2H  = (f.homeH2HWins / totalH2H - 0.5) * 2;
  const awayH2H  = (f.awayH2HWins / totalH2H - 0.5) * 2;

  const homeScore = calcScore(
      f.homeEPA, f.homeRedZone, f.homePlays,
      f.awayPressure, f.awayPointsAllowed,
      f.homeMomentum, f.homeInjuryImpact,
      homeH2H, true, wx, f.isDivisional,
  );

  const awayScore = calcScore(
      f.awayEPA, f.awayRedZone, f.awayPlays,
      f.homePressure, f.homePointsAllowed,
      f.awayMomentum, f.awayInjuryImpact,
      awayH2H, false, wx, f.isDivisional,
  );

  return { homeScore, awayScore };
}

export function runSimulation(
    homeScore: number,
    awayScore: number,
    iterations = 10_000,
): {
  homeWinPct: number; awayWinPct: number; tiesPct: number;
  confidence: number; confidenceLabel: string;
  topScores: Array<{ home: number; away: number; pct: number }>;
} {
  let homeWins = 0, awayWins = 0, ties = 0;
  const scoreMap = new Map<string, number>();

  for (let i = 0; i < iterations; i++) {
    const gauss = () => {
      const u = 1 - Math.random(), v = 1 - Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 9.5;
    };
    const h = Math.max(0, Math.round(homeScore + gauss()));
    const a = Math.max(0, Math.round(awayScore + gauss()));
    if (h > a) homeWins++; else if (a > h) awayWins++; else ties++;
    const k = `${h}-${a}`;
    scoreMap.set(k, (scoreMap.get(k) ?? 0) + 1);
  }

  const hwp = Math.round((homeWins / iterations) * 1000) / 10;
  const awp = Math.round((awayWins / iterations) * 1000) / 10;
  const tp  = Math.round((ties     / iterations) * 1000) / 10;
  const margin = Math.abs(hwp - awp);
  const confidence = Math.min(99, Math.round(50 + margin * 0.9));
  const confidenceLabel =
      margin > 35 ? 'Very High' : margin > 20 ? 'High' : margin > 10 ? 'Medium' : 'Low';

  const topScores = [...scoreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, c]) => {
        const [h, aw] = k.split('-').map(Number);
        return { home: h, away: aw, pct: Math.round((c / iterations) * 1000) / 10 };
      });

  return { homeWinPct: hwp, awayWinPct: awp, tiesPct: tp, confidence, confidenceLabel, topScores };
}

export function computeBreakdown(f: GameFactors): Array<{ label: string; homeEdge: number }> {
  return [
    { label: 'EPA',         homeEdge: Math.round((f.homeEPA - f.awayEPA) * 27 * 10) / 10 },
    { label: 'Red Zone',    homeEdge: Math.round(((f.homeRedZone - f.awayRedZone) * 0.25) * 10) / 10 },
    { label: 'Pace',        homeEdge: Math.round(((f.homePlays - f.awayPlays) / 66 * 5) * 10) / 10 },
    { label: 'Defense',     homeEdge: Math.round((f.awayPointsAllowed - f.homePointsAllowed) * 0.3 * 10) / 10 },
    { label: 'Pressure',    homeEdge: Math.round((f.awayPressure - f.homePressure) * 0.15 * 10) / 10 },
    { label: 'Home Field',  homeEdge: 2.5 },
    { label: 'Injuries',    homeEdge: Math.round((f.awayInjuryImpact - f.homeInjuryImpact) * 10) / 10 },
    { label: 'Momentum',    homeEdge: Math.round(((momentumMap[f.homeMomentum] ?? 0) - (momentumMap[f.awayMomentum] ?? 0)) * 10) / 10 },
    { label: 'H2H History', homeEdge: Math.round(((f.homeH2HWins - f.awayH2HWins) / (f.homeH2HWins + f.awayH2HWins || 1)) * 10) / 10 },
  ];
}
