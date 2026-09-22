export function oddsToDecimal(odds: number): number {
  return odds > 0 ? odds / 100 + 1 : 100 / Math.abs(odds) + 1;
}

export function calculateEV(prob: number, odds: number) {
  const payout = oddsToDecimal(odds) - 1;
  const ev = prob * payout - (1 - prob);

  return {
    ev,
    edge: ev > 0 ? '+EV' : ev < 0 ? '-EV' : 'Neutral'
  };
}
