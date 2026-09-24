import {
  GameFactors,
  PrecipitationType,
  predictGame,
  runSimulation,
  computeBreakdown,
} from './scoringEngine';
import { fetchGameInfo, fetchWeather, fetchInjuries } from './gameService';
import { fetchNFLOdds, findOddsForGame } from './oddsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapPrecipitation(pct: number): PrecipitationType {
  if (pct === 0)  return 'none';
  if (pct < 20)   return 'light';
  if (pct < 50)   return 'heavy';
  if (pct < 75)   return 'snow';
  return 'blizzard';
}

function computeInjuryImpact(
    injuryList: { player: string; status: string }[],
): number {
  return injuryList.reduce((sum, inj) => {
    switch (inj.status.toLowerCase()) {
      case 'out':          return sum + 2.5;
      case 'doubtful':     return sum + 1.8;
      case 'questionable': return sum + 1.0;
      default:             return sum;
    }
  }, 0);
}

function moneylineToImpliedProb(ml: number | null): number | null {
  if (ml === null) return null;
  if (ml > 0) return 100 / (ml + 100);
  return Math.abs(ml) / (Math.abs(ml) + 100);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function generatePrediction(gameId: number) {
  const id = gameId.toString();

  const [gameInfo, weather, injuries, allOdds] = await Promise.all([
    fetchGameInfo(id),
    fetchWeather(id),
    fetchInjuries(id),
    fetchNFLOdds(),
  ]);

  const odds = gameInfo
      ? findOddsForGame(allOdds, gameInfo.teamA, gameInfo.teamB)
      : null;

  // ── Build factors ────────────────────────────────────────────────────────

  const factors: GameFactors = {
    homeEPA:           0.05,
    awayEPA:           0.02,
    homeRedZone:       58,
    awayRedZone:       55,
    homePressure:      28,
    awayPressure:      26,
    homePointsAllowed: 22,
    awayPointsAllowed: 23,
    homePlays:         66,
    awayPlays:         64,
    homeMomentum:      '2-1',
    awayMomentum:      '1-2',
    stadiumType:       'outdoor',
    temp:              weather?.temp          ?? 55,
    wind:              weather?.wind          ?? 8,
    precipitation:     mapPrecipitation(weather?.precipitation ?? 0),
    homeInjuryImpact:  computeInjuryImpact(injuries ?? []),
    awayInjuryImpact:  0,
    homeH2HWins:       12,
    awayH2HWins:       10,
    isDivisional:      false,
  };

  // ── Run the engine ───────────────────────────────────────────────────────

  const { homeScore, awayScore } = predictGame(factors);
  const simulation  = runSimulation(homeScore, awayScore);
  const breakdown   = computeBreakdown(factors);

  const modelSpread    = homeScore - awayScore;
  const modelOverUnder = Math.round((homeScore + awayScore) * 2) / 2;
  const winner         = homeScore >= awayScore ? gameInfo?.teamA : gameInfo?.teamB;

  // ── Vegas comparison ─────────────────────────────────────────────────────

  const vegasSpread    = odds?.spread        ?? null;
  const vegasOverUnder = odds?.overUnder     ?? null;
  const homeImplied    = moneylineToImpliedProb(odds?.homeMoneyline ?? null);
  const awayImplied    = moneylineToImpliedProb(odds?.awayMoneyline ?? null);

  const homeEdge   = homeImplied !== null
      ? Math.round((simulation.homeWinPct / 100 - homeImplied) * 1000) / 10
      : null;
  const awayEdge   = awayImplied !== null
      ? Math.round((simulation.awayWinPct / 100 - awayImplied) * 1000) / 10
      : null;
  const spreadDiff = vegasSpread !== null
      ? Math.round((modelSpread - Math.abs(vegasSpread)) * 10) / 10
      : null;
  const totalDiff  = vegasOverUnder !== null
      ? Math.round((modelOverUnder - vegasOverUnder) * 10) / 10
      : null;

  return {
    gameId,
    teamA:           gameInfo?.teamA     ?? 'Home',
    teamB:           gameInfo?.teamB     ?? 'Away',
    predictedScoreA: Math.round(homeScore),
    predictedScoreB: Math.round(awayScore),
    winner,
    modelSpread:     modelSpread >= 0
        ? `Home -${Math.abs(modelSpread).toFixed(1)}`
        : `Away -${Math.abs(modelSpread).toFixed(1)}`,
    modelOverUnder,
    vegasSpread,
    vegasOverUnder,
    homeMoneyline:   odds?.homeMoneyline ?? null,
    awayMoneyline:   odds?.awayMoneyline ?? null,
    bookmaker:       odds?.bookmaker     ?? null,
    homeImpliedProb: homeImplied !== null ? Math.round(homeImplied * 1000) / 10 : null,
    awayImpliedProb: awayImplied !== null ? Math.round(awayImplied * 1000) / 10 : null,
    homeEdge,
    awayEdge,
    spreadDiff,
    totalDiff,
    homeWinPct:      simulation.homeWinPct,
    awayWinPct:      simulation.awayWinPct,
    tiesPct:         simulation.tiesPct,
    confidence:      simulation.confidence,
    confidenceLabel: simulation.confidenceLabel,
    topScores:       simulation.topScores,
    breakdown,
    factors,
    weather,
    injuries,
  };
}
