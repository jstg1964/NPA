import "./index.css";
import { useState } from "react";

import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

import TeamSelector from "./components/TeamSelector";
import GamePredictionPanel from "./components/GamePredictionPanel";
import TeamLogos from "./components/TeamLogos";
import OddsPanel from "./components/OddsPanel";
import PerformanceChart from "./components/PerformanceChart";
import WeatherPanel from "./components/WeatherPanel";
import InjuryAlerts from "./components/InjuryAlerts";

import { generatePrediction } from "./api/prediction";
import type { Game } from "./api/games";

export default function App() {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [prediction, setPrediction] = useState<any | null>(null);

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
                        }}
                    />

                    {selectedGame && (
                        <TeamLogos teamA={selectedGame.teamA} teamB={selectedGame.teamB} />
                    )}

                    <GamePredictionPanel
                        gameId={selectedGame?.id ?? null}
                        onPrediction={(p) => setPrediction(p)}
                    />

                    {prediction && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <PerformanceChart confidence={prediction.confidence} />

                            <OddsPanel
                                odds={prediction.odds}
                                bettingLines={prediction.bettingLines}
                                onRefresh={() => {
                                    generatePrediction(selectedGame!.id).then(setPrediction);
                                }}
                            />

                            <WeatherPanel weather={prediction.weather} />

                            <InjuryAlerts injuries={prediction.injuries} />

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
