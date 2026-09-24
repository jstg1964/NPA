// ─── Types ────────────────────────────────────────────────────────────────────

export type PrecipitationType = 'none' | 'light' | 'heavy' | 'snow' | 'blizzard';

export interface GameFactors {
  homeEPA:           number;
  awayEPA:           number;
  homeRedZone:       number;
  awayRedZone:       number;
  homePressure:      number;
  awayPressure:      number;
  homePointsAllowed: number;
  awayPointsAllowed: number;
  homePlays:         number;
  awayPlays:         number;
  homeMomentum:      '3-0' | '2-1' | '1-2' | '0-3';
  awayMomentum:      '3-0' | '2-1' | '1-2' | '0-3';
  stadiumType:       'outdoor' | 'dome' | 'neutral';
  temp:              number;
  wind:              number;
  precipitation:     PrecipitationType;
  homeInjuryImpact:  number;
  awayInjuryImpact:  number;
  homeH2HWins:       number;
  awayH2HWins:       number;
  isDivisional:      boolean;
}

export interface ScoringResult {
  homeScore: number;
  awayScore: number;
}

export interface SimulationResult {
  homeWinPct:      number;
  awayWinPct:      number;
  tiesPct:         number;
  topScores:       { score: string; pct: string }[];
  confidence:      number;
  confidenceLabel: string;
}

export interface FactorBreakdown {
  label: string;
  value: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOMENTUM_VALUES: Record<string, number> = {
  '3-0':  2.0,
  '2-1':  0.5,
  '1-2': -0.5,
  '0-3': -2.0,
};

const RAIN_PENALTY: Record<PrecipitationType, number> = {
  none:     0,
  light:    1.5,
  heavy:    3.5,
  snow:     4.0,
  blizzard: 7.0,
};

// ─── Gaussian RNG (Box-Muller) ────────────────────────────────────────────────

function gaussianRandom(mean: number, std: number): number {
  let u1 = Math.random();
  const u2 = Math.random();
  while (u1 === 0) u1 = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// ─── Predict Game ─────────────────────────────────────────────────────────────

export function predictGame(f: GameFactors): ScoringResult {
  let home = 23;
  let away = 23;

  // EPA/play
  home += f.homeEPA * 27;
  away += f.awayEPA * 27;

  // Defensive pressure
  home -= (f.awayPressure - 26) * 0.15;
  away -= (f.homePressure - 26) * 0.15;

  // Points-allowed normalisation
  home = home * 0.6 + (42 - f.awayPointsAllowed) * 0.4;
  away = away * 0.6 + (42 - f.homePointsAllowed) * 0.4;

  // Red-zone efficiency
  home *= f.homeRedZone / 58;
  away *= f.awayRedZone / 58;

  // Pace multiplier
  home *= f.homePlays / 66;
  away *= f.awayPlays / 66;

  // Home-field advantage
  if (f.stadiumType !== 'neutral') home += 2.5;

  // Weather — outdoor only
  if (f.stadiumType === 'outdoor') {
    if (f.wind > 15) {
      const windPenalty = (f.wind - 15) * 0.25;
      home -= windPenalty * 0.5;
      away -= windPenalty * 0.6;
    }
    if (f.temp < 25) {
      home -= (25 - f.temp) * 0.08;
      away -= (25 - f.temp) * 0.10;
    }
    if (f.temp > 85) {
      home -= (f.temp - 85) * 0.05;
      away -= (f.temp - 85) * 0.04;
    }
    home -= RAIN_PENALTY[f.precipitation];
    away -= RAIN_PENALTY[f.precipitation] * 1.1;
  }

  // Injuries
  home -= f.homeInjuryImpact;
  away -= f.awayInjuryImpact;

  // Momentum
  home += MOMENTUM_VALUES[f.homeMomentum] ?? 0;
  away += MOMENTUM_VALUES[f.awayMomentum] ?? 0;

  // Divisional dampening — scores compress toward the mean
  if (f.isDivisional) {
    const avg = (home + away) / 2;
    home = home * 0.85 + avg * 0.15;
    away = away * 0.85 + avg * 0.15;
  }

  // Head-to-head edge
  const totalH2H = f.homeH2HWins + f.awayH2HWins;
  if (totalH2H > 0) {
    const edge = ((f.homeH2HWins / totalH2H) - 0.5) * 3;
    home += edge;
    away -= edge * 0.5;
  }

  return {
    homeScore: Math.max(7, Math.min(52, home)),
    awayScore: Math.max(7, Math.min(52, away)),
  };
}

// ─── Monte Carlo Simulation ───────────────────────────────────────────────────

export function runSimulation(
    homeScore: number,
    awayScore: number,
    n = 10_000,
): SimulationResult {
  let homeWins = 0;
  let awayWins = 0;
  let ties     = 0;
  const scoreCounts: Record<string, number> = {};

  for (let i = 0; i < n; i++) {
    const h = Math.max(0, Math.round(homeScore + gaussianRandom(0, 9.5)));
    const a = Math.max(0, Math.round(awayScore + gaussianRandom(0, 9.5)));

    if      (h > a) homeWins++;
    else if (a > h) awayWins++;
    else            ties++;

    const key = `${h}-${a}`;
    scoreCounts[key] = (scoreCounts[key] ?? 0) + 1;
  }

  const topScores = Object.entries(scoreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([score, count]) => ({
        score,
        pct: ((count / n) * 100).toFixed(1),
      }));

  const homeWinPct = (homeWins / n) * 100;
  const awayWinPct = (awayWins / n) * 100;
  const raw        = Math.abs(homeWinPct - 50) / 50;
  const confidence = Math.round(50 + raw * 45);

  let confidenceLabel: string;
  if      (confidence >= 85) confidenceLabel = '🔒 LOCK';
  else if (confidence >= 70) confidenceLabel = '✅ HIGH CONFIDENCE';
  else if (confidence >= 55) confidenceLabel = '📊 LEAN';
  else                       confidenceLabel = '🎲 TOSS-UP';

  return {
    homeWinPct: Math.round(homeWinPct * 10) / 10,
    awayWinPct: Math.round(awayWinPct * 10) / 10,
    tiesPct:    Math.round((ties / n) * 1000) / 10,
    topScores,
    confidence,
    confidenceLabel,
  };
}

// ─── Factor Breakdown ─────────────────────────────────────────────────────────

export function computeBreakdown(f: GameFactors): FactorBreakdown[] {
  const totalH2H = f.homeH2HWins + f.awayH2HWins;
  const h2hValue = totalH2H > 0
      ? ((f.homeH2HWins / totalH2H) - 0.5) * 4.5
      : 0;

  let weatherValue = 0;
  if (f.stadiumType === 'outdoor') {
    if (f.wind > 15) weatherValue -= (f.wind - 15) * 0.025;
    weatherValue -= RAIN_PENALTY[f.precipitation] * 0.1;
  }

  return [
    {
      label: 'EPA Advantage',
      value: (f.homeEPA - f.awayEPA) * 27,
    },
    {
      label: 'Home Field',
      value: f.stadiumType !== 'neutral' ? 2.5 : 0,
    },
    {
      label: 'Defensive Edge',
      value: (f.awayPressure - f.homePressure) * 0.15,
    },
    {
      label: 'Red Zone Edge',
      value: (f.homeRedZone - f.awayRedZone) * 0.2,
    },
    {
      label: 'Injury Impact',
      value: -(f.homeInjuryImpact - f.awayInjuryImpact),
    },
    {
      label: 'Weather',
      value: weatherValue,
    },
    {
      label: 'Momentum',
      value: (MOMENTUM_VALUES[f.homeMomentum] ?? 0) - (MOMENTUM_VALUES[f.awayMomentum] ?? 0),
    },
    {
      label: 'H2H History',
      value: h2hValue,
    },
    {
      label: 'Pace Edge',
      value: ((f.homePlays - f.awayPlays) / 66) * 3,
    },
  ];
}
