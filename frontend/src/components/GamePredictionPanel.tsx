import { GamePredictionResponse } from '../api/prediction';

interface Props {
  prediction: GamePredictionResponse | null;
}

export default function GamePredictionPanel({ prediction }: Props) {
  if (!prediction) return null;

  return (
    <section className="bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Game Prediction</h2>

      <p className="text-lg">
        Winner:{' '}
        <span className="font-bold text-green-400">
          {prediction.winner}
        </span>
      </p>
      <p>Score: {prediction.score}</p>
      <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>

      <div className="mt-4 text-sm text-gray-300">{prediction.script}</div>
    </section>
  );
}
