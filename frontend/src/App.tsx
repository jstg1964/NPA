import "./App.css";
import { useState } from "react";
import TeamSelector from "./components/TeamSelector";
import GamePredictionPanel from "./components/GamePredictionPanel";
import type { Game } from "./api/games";

function App() {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    return (
        <div className="app">
            <h1>NFL Betting Assistant</h1>

            <TeamSelector
                selectedGame={selectedGame}
                onSelectGame={(game) => setSelectedGame(game)}
            />

            <GamePredictionPanel gameId={selectedGame?.id ?? null} />
        </div>
    );
}

export default App;
