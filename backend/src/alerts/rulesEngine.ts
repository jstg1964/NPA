export function evaluateAlerts(prev: any, current: any): string[] {
  const alerts: string[] = [];

  if (prev.spread?.odds !== current.spread?.odds) {
    alerts.push(`Spread odds moved: ${prev.spread?.odds} → ${current.spread?.odds}`);
  }

  if (prev.injuryImpact !== current.injuryImpact) {
    alerts.push('Injury update changed team strength.');
  }

  if (prev.weatherImpact !== current.weatherImpact) {
    alerts.push(`Weather changed: impact now ${current.weatherImpact}`);
  }

  if (prev.ev?.edge !== current.ev?.edge) {
    alerts.push(`EV flipped: ${prev.ev?.edge} → ${current.ev?.edge}`);
  }

  return alerts;
}
