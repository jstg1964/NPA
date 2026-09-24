interface FactorBreakdown { label: string; value: number; }

interface Props {
    prediction: any;
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

function BreakdownBar({ label, value }: FactorBreakdown) {
    const max = 8;
    const pct = Math.min(Math.abs(value) / max * 50, 50);
    const isHome = value >= 0;
    return (
        <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="w-28 text-gray-400 text-right shrink-0">{label}</span>
            <div className="flex-1 flex h-4">
                <div className="w-1/2 flex justify-end">
                    {!isHome && (
                        <div className="h-full bg-red-500 rounded-l transition-all duration-500"
                             style={{ width: `${pct * 2}%` }} />
                    )}
                </div>
                <div className="w-px bg-gray-600" />
                <div className="w-1/2">
                    {isHome && (
                        <div className="h-full bg-green-500 rounded-r transition-all duration-500"
                             style={{ width: `${pct * 2}%` }} />
                    )}
                </div>
            </div>
            <span className={`w-12 font-mono shrink-0 ${isHome ? 'text-green-400' : 'text-red-400'}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(1)}
      </span>
        </div>
    );
}

function ConfidenceGauge({ value }: { value: number }) {
    const radius = 40;
    const circumference = Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = value >= 70 ? '#16a34a' : value >= 55 ? '#f59e0b' : '#ef4444';
    return (
        <svg width="100" height="60" viewBox="0 0 100 60">
            <path d={`M 10 50 A 40 40 0 0 1 90 50`}
                  fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
            <path d={`M 10 50 A 40 40 0 0 1 90 50`}
                  fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x="50" y="46" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                {value}%
            </text>
        </svg>
    );
}

export default function PredictionModal({ prediction, loading, error, onClose }: Props) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
                <div className="p-6">

                    {loading && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4 animate-spin">⚙️</div>
                            <p className="text-gray-400">Running 10,000 simulations…</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button onClick={onClose} className="px-4 py-2 bg-red-700 rounded">Close</button>
                        </div>
                    )}

                    {!loading && !error && prediction && (
                        <>
                            {/* Score header */}
                            <div className="text-center mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Predicted Final Score</p>
                                <p className="text-3xl font-black tracking-wider">
                                    <span className="text-green-400">{prediction.teamA} {prediction.predictedScoreA}</span>
                                    <span className="text-gray-600 mx-3">—</span>
                                    <span className="text-blue-400">{prediction.teamB} {prediction.predictedScoreB}</span>
                                </p>
                                <div className="mt-2 flex justify-center gap-4 text-sm text-gray-400">
                                    <span>Spread: <strong className="text-white">{prediction.spread}</strong></span>
                                    <span>O/U: <strong className="text-white">{prediction.overUnder}</strong></span>
                                </div>
                                <div className="mt-3 inline-block px-4 py-1 bg-green-800 rounded-full text-sm font-bold">
                                    🏆 {prediction.winner}
                                </div>
                            </div>

                            {/* Win probability bar */}
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 text-center">Win Probability</p>
                                <div className="flex h-6 rounded-full overflow-hidden">
                                    <div className="bg-green-600 flex items-center justify-center text-xs font-bold transition-all duration-700"
                                         style={{ width: `${prediction.homeWinPct}%` }}>
                                        {prediction.homeWinPct}%
                                    </div>
                                    <div className="bg-blue-600 flex items-center justify-center text-xs font-bold transition-all duration-700"
                                         style={{ width: `${prediction.awayWinPct}%` }}>
                                        {prediction.awayWinPct}%
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{prediction.teamA}</span>
                                    <span>{prediction.teamB}</span>
                                </div>
                            </div>

                            {/* Confidence gauge */}
                            <div className="flex flex-col items-center mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Confidence</p>
                                <ConfidenceGauge value={prediction.confidence} />
                                <p className="text-sm font-bold mt-1">{prediction.confidenceLabel}</p>
                            </div>

                            {/* Top 5 scores */}
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Most Likely Final Scores</p>
                                <div className="space-y-1">
                                    {prediction.topScores?.map((s: any, i: number) => (
                                        <div key={s.score}
                                             className={`flex justify-between px-3 py-1 rounded text-sm
                        ${i === 0 ? 'bg-green-900 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}>
                                            <span>#{i + 1} &nbsp; {s.score}</span>
                                            <span>{s.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Factor breakdown */}
                            {prediction.breakdown?.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 text-center">
                                        Factor Breakdown <span className="text-gray-600">(green = home, red = away)</span>
                                    </p>
                                    {prediction.breakdown.map((f: FactorBreakdown) => (
                                        <BreakdownBar key={f.label} label={f.label} value={f.value} />
                                    ))}
                                </div>
                            )}

                            <button onClick={onClose}
                                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                                Close
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
