interface Props {
  teamA: string;
  teamB: string;
  onChangeA: (v: string) => void;
  onChangeB: (v: string) => void;
  onPredict: () => void;
}

const teams = ['Rams', 'Giants', 'Patriots', 'Chiefs', 'Bills', 'Eagles'];

export default function TeamSelector({ teamA, teamB, onChangeA, onChangeB, onPredict }: Props) {
  return (
    <section className="bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Select Teams</h2>

      <div className="grid grid-cols-2 gap-4">
        <select
          className="bg-gray-700 p-2 rounded"
          value={teamA}
          onChange={(e) => onChangeA(e.target.value)}
        >
          <option value="">Team A</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="bg-gray-700 p-2 rounded"
          value={teamB}
          onChange={(e) => onChangeB(e.target.value)}
        >
          <option value="">Team B</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        onClick={onPredict}
        disabled={!teamA || !teamB}
      >
        Predict Game
      </button>
    </section>
  );
}
