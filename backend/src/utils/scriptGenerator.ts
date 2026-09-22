export interface GameContext {
  pace: number;
  weatherImpact: number;
  injuryImpact: {
    teamA: number;
    teamB: number;
  };
}

export interface ScoreProjection {
  teamA_points: number;
  teamB_points: number;
}

export function generateScript(
  teamA: string,
  teamB: string,
  ctx: GameContext,
  score: ScoreProjection
): string {
  const { pace, weatherImpact, injuryImpact } = ctx;
  const { teamA_points, teamB_points } = score;

  let script = '';

  script += pace > 12 ? 'Fast-paced game with plenty of possessions. ' : 'Slower tempo, fewer drives. ';

  if (weatherImpact < -1) script += 'Weather likely suppresses deep passing. ';

  if (injuryImpact.teamA < -3) script += `${teamA} missing key offensive pieces. `;
  if (injuryImpact.teamB < -3) script += `${teamB} dealing with major injuries. `;

  const diff = teamA_points - teamB_points;

  script += diff > 7
    ? `${teamA} likely leads early while ${teamB} chases.`
    : diff < -7
    ? `${teamB} likely controls the game.`
    : 'Game projects as tight with late swings.';

  return script;
}
