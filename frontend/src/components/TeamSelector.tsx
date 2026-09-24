import { useEffect, useState } from 'react';
import { fetchGames } from '../api/games';
import type { Game } from '../api/games';

// ─── Week config ──────────────────────────────────────────────────────────────

const TOTAL_WEEKS   = 18;
const CURRENT_WEEK  = 3;

const WEEK_OPTIONS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    selectedGame: Game | null;
    onSelectGame: (game: Game) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeamSelector({ selectedGame, onSelectGame }: Props) {
    const [week,    setWeek]    = useState<number>(CURRENT_WEEK);
    const [games,   setGames]   = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    // Fetch whenever the selected week changes
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchGames(week)
            .then(setGames)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [week]);

    return (
        <div className="bg-gray-800 rounded-xl p-4 space-y-4">

            {/* ── Top bar: Week picker + label ─────────────────────────────────── */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        🗓 NFL Week
                    </label>
                    <select
                        value={week}
                        onChange={e => {
                            setWeek(Number(e.target.value));
                            onSelectGame(null as any); // clear selection on week change
                        }}
                        className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {WEEK_OPTIONS.map(w => (
                            <option key={w} value={w}>
                                Week {w}{w === CURRENT_WEEK ? ' (Current)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <p className="text-xs text-gray-500">
                    {loading
                        ? 'Loading schedule...'
                        : error
                            ? `⚠️ ${error}`
                            : `${games.length} game${games.length !== 1 ? 's' : ''} — pick one to predict`}
                </p>
            </div>

            {/* ── Game cards ───────────────────────────────────────────────────── */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-700 rounded-lg animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="bg-red-900 rounded-lg p-3 text-red-300 text-sm">
                    Could not load Week {week} schedule. Check that the backend is running.
                </div>
            )}

            {!loading && !error && games.length === 0 && (
                <div className="bg-gray-700 rounded-lg p-4 text-gray-400 text-sm text-center">
                    No games scheduled for Week {week} yet.
                </div>
            )}

            {!loading && !error && games.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {games.map(game => {
                        const isSelected = selectedGame?.id === game.id;

                        return (
                            <button
                                key={game.id}
                                onClick={() => onSelectGame(game)}
                                className={`w-full text-left rounded-lg px-3 py-3 transition border
                  ${isSelected
                                    ? 'bg-green-900 border-green-500 ring-1 ring-green-500'
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                            >
                                {/* Teams row */}
                                <div className="flex items-center justify-between gap-1">

                                    {/* Away team */}
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {game.teamBLogo && (
                                            <img
                                                src={game.teamBLogo}
                                                alt={game.teamBAbbrev}
                                                className="w-8 h-8 object-contain flex-shrink-0"
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-blue-300 leading-tight truncate">
                                                {game.teamBAbbrev}
                                            </p>
                                            <p className="text-xs text-gray-500 leading-tight">{game.teamBRecord}</p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex-shrink-0 text-center px-1">
                                        <p className="text-xs text-gray-500 font-bold">@</p>
                                    </div>

                                    {/* Home team */}
                                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-row-reverse">
                                        {game.teamALogo && (
                                            <img
                                                src={game.teamALogo}
                                                alt={game.teamAAbbrev}
                                                className="w-8 h-8 object-contain flex-shrink-0"
                                            />
                                        )}
                                        <div className="min-w-0 text-right">
                                            <p className="text-sm font-bold text-green-300 leading-tight truncate">
                                                {game.teamAAbbrev}
                                            </p>
                                            <p className="text-xs text-gray-500 leading-tight">{game.teamARecord}</p>
                                        </div>
                                    </div>

                                </div>

                                {/* Full team names row */}
                                <div className="flex justify-between mt-1 text-xs text-gray-400 px-0.5">
                                    <span className="truncate text-blue-200">{game.teamB}</span>
                                    <span className="truncate text-right text-green-200">{game.teamA}</span>
                                </div>

                                {/* Details row */}
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                                    <span>🕐 {game.gameTime}</span>
                                    {game.broadcast  && <span>📺 {game.broadcast}</span>}
                                    {game.spread     && <span>📊 {game.spread}</span>}
                                    {game.overUnder  && <span>O/U {game.overUnder}</span>}
                                    {game.indoor
                                        ? <span>🏟 Dome</span>
                                        : game.weatherTemp
                                            ? <span>🌡 {game.weatherTemp}°F {game.weatherDesc ?? ''}</span>
                                            : null}
                                </div>

                            </button>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
