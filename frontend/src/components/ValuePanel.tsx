import { GamePredictionResponse } from '../api/prediction';

interface Props {
  prediction: GamePredictionResponse | null;
}

export default function ValuePanel({ prediction }: Props) {
  if (!prediction) return null;

  const { ev, odds } = prediction;

  return (
    <section className="bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Value Analysis</h2>

      <p>
        Spread ({odds.spread.team} {odds.spread.line}):{' '}
        <span
          className={
            ev.edge === '+EV'
              ? 'text-green-400 font-bold'
              : ev.edge === '-EV'
              ? 'text-red-400 font-bold'
              : 'text-gray-300'
          }
        >
          {ev.edge}
        </span>
      </p>
      <p>EV: {ev.ev.toFixed(3)}</p>
    </section>
  );
}
