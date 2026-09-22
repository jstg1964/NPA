import { broadcast } from '../realtime/socket';

export function dispatchAlerts(alerts: string[]) {
  alerts.forEach((message) => broadcast('alert', { message }));
}
