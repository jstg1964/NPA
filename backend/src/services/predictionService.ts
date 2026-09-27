import { predictGame, runSimulation, GameFactors } from './scoringEngine';
import { fetchNFLOdds, findOddsForGame } from './oddsService';

export interface IncomingFactors {
  homeEpa:           number;   // raw yardsPerPassAttempt from ESPN (~4–9)
  awayEpa:           number;
  homeRedZone:       number;   // 0–100
  awayRedZone:       number;
  homePlays:         number;   // plays per game 45–85
  awayPlays:         number;
  homePressure:      number;   // raw sacks from ESPN (~0–6)
  awayPressure:      number;
  homePointsAllowed: number;   // points per game
  awayPointsAllowed: number;
  homeH2HWins:       number;
  awayH2HWins:       number;
  homeInjury:        number;
  awayInjury:        number;
  stadiumType:       'outdoor' | 'dome' | 'neutral';
  temp:              number;
  wind:              number;
  precipitation:     'none' | 'light' | 'heavy' | 'snow' | 'blizzard';
  homeTeam?:         string;
  awayTeam?:         string;
}

// ─── Normalization helpers ────────────────────────────────────────────────────

/**
 * ESPN returns yardsPerPassAttempt (~4–9 range).
 * scoringEngine expects EPA per play in the range -0.3 to 0.3.
 * Normalize: league avg YPA is ~7.0, shift and scale to -0.3..0.3.
 */
function normalizeEPA(ypa: number): number {
  const normalized = (ypa - 7.0) / 10;
  return Math.max(-0.3, Math.min(0.3, normalized));
}

/**
 * ESPN returns sacks (raw count ~0–6 per game).
 * scoringEngine expects pressure rate in the range 15–45.
 * Normalize: sacks * 6 + 15, clamped to 15–45.
 */
function normalizePressure(sacks: number): number {
  return Math.max(15, Math.min(45, sacks * 6 + 15));
}

/**
 * Derive a simple momentum string from H2H wins.
 * Used to satisfy the scoringEngine momentum field requirement.
 */
function deriveMomentum(h2hWins: number): '3-0' | '2-1' | '1-2' | '0-3' {
  if (h2hWins >= 3) return '3-0';
  if (h2hWins === 2) return '2-1';
  if (h2hWins === 1) return '1-2';
  return '0-3';
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generatePrediction(gameId: number, factors: IncomingFactors) {
  // Map and normalize frontend factors to the scoring engine's expected ranges
  const gameFactors: GameFactors = {
    homeEPA:           normalizeEPA(factors.homeEpa),
    awayEPA:           normalizeEPA(factors.awayEpa),
    homeRedZone:       factors.homeRedZone,
    awayRedZone:       factors.awayRedZone,
    homePlays:         factors.homePlays,
    awayPlays:         factors.awayPlays,
    homePressure:      normalizePressure(factors.homePressure),
    awayPressure:      normalizePressure(factors.awayPressure),
    homePointsAllowed: factors.homePointsAllowed,
    awayPointsAllowed: factors.awayPointsAllowed,
    homeH2HWins:       factors.homeH2HWins,
    awayH2HWins:       factors.awayH2HWins,
    homeInjuryImpact:  factors.homeInjury,
    awayInjuryImpact:  factors.awayInjury,
    stadiumType:       factors.stadiumType,
    temp:              factors.temp,
    wind:              factors.wind,
    precipitation:     factors.precipitation,
    homeMomentum:      deriveMomentum(factors.homeH2HWins),
    awayMomentum:      deriveMomentum(factors.awayH2HWins),
    isDivisional:      false,
  };

  // Run the scoring engine
  const { homeScore, awayScore } = predictGame(gameFactors);

  // Monte-Carlo simulation for win % and confidence
  const sim = runSimulation(homeScore, awayScore);

  // Fetch live Vegas odds and match to this game
  const allOdds = await fetchNFLOdds().catch(() => []);
  const odds = (factors.homeTeam && factors.awayTeam)
      ? findOddsForGame(allOdds, factors.homeTeam, factors.awayTeam)
      : null;

  const modelSpread    = Math.round((homeScore - awayScore) * 10) / 10;
  const modelOverUnder = Math.round((homeScore + awayScore) * 10) / 10;

  return {
    predictedScoreA:  Math.round(awayScore),
    predictedScoreB:  Math.round(homeScore),
    winner:           homeScore >= awayScore ? 'home' : 'away',
    confidence:       sim.confidence,
    homeWinPct:       sim.homeWinPct,
    awayWinPct:       sim.awayWinPct,
    modelSpread,
    modelOverUnder,
    vegasSpread:      odds?.spread        ?? null,
    vegasOverUnder:   odds?.overUnder     ?? null,
    spreadDiff:       odds?.spread        != null ? modelSpread    - odds.spread    : null,
    totalDiff:        odds?.overUnder     != null ? modelOverUnder - odds.overUnder : null,
    homeMoneyline:    odds?.homeMoneyline ?? null,
    awayMoneyline:    odds?.awayMoneyline ?? null,
    homeEdge:         null,
    awayEdge:         null,
    bookmaker:        odds?.bookmaker     ?? null,
    injuries:         [],
  };
}
