import { predictGame, runSimulation, computeBreakdown, GameFactors } from './scoringEngine';
import { fetchNFLOdds, findOddsForGame } from './oddsService';

export interface IncomingFactors {
  homeEpa:           number;
  awayEpa:           number;
  homeRedZone:       number;
  awayRedZone:       number;
  homePlays:         number;
  awayPlays:         number;
  homePressure:      number;
  awayPressure:      number;
  homePointsAllowed: number;
  awayPointsAllowed: number;
  homeH2HWins:       number;
  awayH2HWins:       number;
  homeInjury:        number;
  awayInjury:        number;
  stadiumType:       'outdoor' | 'dome' | 'neutral';
  temp:              number;
  wind:              number;
  precipitation:     'none' | 'light' | 'heavy' | 'snow' | 'blizzard';
  // Team names passed from the frontend for odds matching
  homeTeam?:         string;
  awayTeam?:         string;
}

export async function generatePrediction(gameId: number, factors: IncomingFactors) {
  // Map frontend factors to the scoring engine's GameFactors shape
  const gameFactors: GameFactors = {
    homeEPA:           factors.homeEpa,
    awayEPA:           factors.awayEpa,
    homeRedZone:       factors.homeRedZone,
    awayRedZone:       factors.awayRedZone,
    homePlays:         factors.homePlays,
    awayPlays:         factors.awayPlays,
    homePressure:      factors.homePressure,
    awayPressure:      factors.awayPressure,
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
    // Momentum not yet in the UI — default to neutral
    homeMomentum:      '2-1',
    awayMomentum:      '2-1',
    // Divisional flag not yet in UI — default false
    isDivisional:      false,
  };

  // Run the scoring engine
  const { homeScore, awayScore } = predictGame(gameFactors);

  // Monte-Carlo simulation for win percentages and confidence
  const sim = runSimulation(homeScore, awayScore);

  // Factor breakdown for display
  const breakdown = computeBreakdown(gameFactors);

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
    confidenceLabel:  sim.confidenceLabel,
    homeWinPct:       sim.homeWinPct,
    awayWinPct:       sim.awayWinPct,
    tiesPct:          sim.tiesPct,
    topScores:        sim.topScores,
    breakdown,
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
