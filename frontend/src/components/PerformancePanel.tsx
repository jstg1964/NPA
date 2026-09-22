interface Performance {
  total: number;
  correctWinners: number;
  scoreErrorA: number;
  scoreErrorB: number;
  avgEV: number;
  avgROI: number;
}

interface Props {
  perf: Performance | null;
}

export default function PerformancePanel({ perf }: Props) {
  if (!perf || perf.total === 0) return null;

  const accuracy = (perf.correctWinners / perf.total) * 100;

  return (
    <section className="bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Model Performance</h2>

      <p>Total Games: {perf.total}</p>
      <p>Winner Accuracy: {accuracy.toFixed(1)}%</p>
      <p>Score Error (Team A): {perf.scoreErrorA.toFixed(2)}</p>
      <p>Score Error (Team B): {perf.scoreErrorB.toFixed(2)}</p>
      <p>Average EV: {perf.avgEV.toFixed(3)}</p>
      <p>Average ROI: {perf.avgROI?.toFixed(3)}</p>
    </section>
  );
}
