import './index.css';
import { useState } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import TeamSelector from './components/TeamSelector';
import GamePredictionPanel from './components/GamePredictionPanel';
import type { Factors } from './components/GamePredictionPanel';
import TeamLogos from './components/TeamLogos';
import OddsPanel from './components/OddsPanel';
import PerformanceChart from './components/PerformanceChart';
import InjuryAlerts from './components/InjuryAlerts';
import { generatePrediction } from './api/prediction';
import type { Game } from './api/games';

function buildOdds(p: any) {
    return {
        homeWinPct:    p.homeWinPct,
        awayWinPct:    p.awayWinPct,
        homeMoneyline: p.homeMoneyline,
        awayMoneyline: p.awayMoneyline,
        homeEdge:      p.homeEdge,
        awayEdge:      p.awayEdge,
        winner:        p.winner,
    };
}

function buildBettingLines(p: any) {
    return {
        modelSpread:    p.modelSpread,
        modelOverUnder: p.modelOverUnder,
        vegasSpread:    p.vegasSpread,
        vegasOverUnder: p.vegasOverUnder,
        spreadDiff:     p.spreadDiff,
        totalDiff:      p.totalDiff,
        bookmaker:      p.bookmaker,
        predictedScore: `${p.predictedScoreA} - ${p.predictedScoreB}`,
    };
}

interface PredictionModalProps {
    prediction: any;
    game: Game;
    onClose: () => void;
    onRefresh: () => void;
}

function PredictionModal({ prediction, game, onClose, onRefresh }: PredictionModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">

                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {game.teamB} <span className="text-gray-500 font-normal">vs</span> {game.teamA}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Prediction confidence: <span className="text-green-400 font-semibold">{prediction.confidence}%</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                {prediction.winner && (
                    <div className="mx-6 mt-4 py-3 rounded-xl bg-gradient-to-r from-green-800/60 to-blue-800/60 border border-green-700/40 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Predicted Winner</p>
                        <p className="text-2xl font-bold text-white">{prediction.winner}</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {prediction.predictedScoreA} &ndash; {prediction.predictedScoreB}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4 p-6">
                    <PerformanceChart confidence={prediction.confidence} />
                    <OddsPanel
                        odds={buildOdds(prediction)}
                        bettingLines={buildBettingLines(prediction)}
                        onRefresh={onRefresh}
                    />
                    <InjuryAlerts injuries={prediction.injuries ?? []} />
                </div>

                <div className="px-6 pb-5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-sm font-semibold text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [prediction,   setPrediction]   = useState<any | null>(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState<string | null>(null);

    async function handlePrediction(factors: Factors) {
        if (!selectedGame) return;
        setLoading(true);
        setError(null);
        setPrediction(null);
        try {
            const result = await generatePrediction(Number(selectedGame.id), factors);
            setPrediction(result);
        } catch (e: any) {
            setError(e?.message ?? 'Prediction failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white dark:bg-black">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="p-6 space-y-6 overflow-auto">

                    <TeamSelector
                        selectedGame={selectedGame}
                        onSelectGame={(game) => {
                            setSelectedGame(game);
                            setPrediction(null);
                            setError(null);
                        }}
                    />

                    {selectedGame && (
                        <TeamLogos teamA={selectedGame.teamA} teamB={selectedGame.teamB} />
                    )}

                    {selectedGame ? (
                        <GamePredictionPanel
                            game={selectedGame}
                            onPrediction={handlePrediction}
                        />
                    ) : (
                        <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
                            Select a game above to start adjusting factors.
                        </div>
                    )}

                    {loading && (
                        <div className="bg-gray-800 rounded-xl p-6 text-center text-yellow-400 text-sm animate-pulse">
                            Generating prediction...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-center text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                </div>
            </div>

            {prediction && !loading && selectedGame && (
                <PredictionModal
                    prediction={prediction}
                    game={selectedGame}
                    onClose={() => setPrediction(null)}
                    onRefresh={() => handlePrediction({} as Factors)}
                />
            )}
        </div>
    );
}
