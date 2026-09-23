import { useEffect, useState } from "react";
import { fetchGames, Game } from "../api/games";

interface Props {
    selectedGame: Game | null;
    onSelectGame: (game: Game) => void;
}

export default function TeamSelector({ selectedGame, onSelectGame }: Props) {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        fetchGames().then(setGames);
    }, []);

    return (
        <div className="space-y-2">
            <label className="text-lg font-semibold">Select Game:</label>

            <select
                className="bg-gray-800 text-white p-3 rounded border border-gray-700"
                value={selectedGame?.id ?? ""}
                onChange={(e) => {
                    const game = games.find((g) => g.id === Number(e.target.value));
                    if (game) onSelectGame(game);
                }}
            >
                <option value="">-- choose a game --</option>
                {games.map((g) => (
                    <option key={g.id} value={g.id}>
                        {g.teamA} vs {g.teamB} ({g.date})
                    </option>
                ))}
            </select>
        </div>
    );
}
