import React, { useState, useEffect } from 'react';
import { fetchGameStats } from '../api/games';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Game {
    id: string;
    teamA: string;
    teamB: string;
    teamAAbbrev: string;
    teamBAbbrev: string;
    teamALogo: string;
    teamBLogo: string;
    teamARecord: string;
    teamBRecord: string;
    teamAId: string;
    teamBId: string;
    venue: string;
    indoor: boolean;
    gameTime: string;
    broadcast: string;
    spread: string;
    overUnder: number;
    weatherTemp: number;
    weatherDesc: string;
}

export interface Factors {
    homeEpa: number;
    awayEpa: number;
    homeRedZone: number;
    awayRedZone: number;
    homePlays: number;
    awayPlays: number;
    homePressure: number;
    awayPressure: number;
    homePointsAllowed: number;
    awayPointsAllowed: number;
    homeH2HWins: number;
    awayH2HWins: number;
    homeInjury: number;
    awayInjury: number;
    stadiumType: 'outdoor' | 'dome' | 'neutral';
    temp: number;
    wind: number;
    precipitation: 'none' | 'light' | 'heavy' | 'snow' | 'blizzard';
}

interface Props {
    game: Game;
    onPrediction: (factors: Factors) => void;
}

// ─── Injury builder constants ─────────────────────────────────────────────────

type InjuryStatus = 'Out' | 'Doubtful' | 'Questionable';
type Stadium      = 'outdoor' | 'dome' | 'neutral';
type Precip       = 'none' | 'light' | 'heavy' | 'snow' | 'blizzard';

const POSITION_IMPACTS: Record<string, Record<InjuryStatus, number>> = {
    QB:  { Out: 12.0, Doubtful: 7.0, Questionable: 3.0 },
    RB1: { Out: 3.5,  Doubtful: 2.0, Questionable: 1.0 },
    WR1: { Out: 4.0,  Doubtful: 2.5, Questionable: 1.5 },
    WR2: { Out: 2.5,  Doubtful: 1.5, Questionable: 0.8 },
    TE:  { Out: 2.5,  Doubtful: 1.5, Questionable: 0.8 },
    OL:  { Out: 3.5,  Doubtful: 2.0, Questionable: 1.0 },
    DL:  { Out: 2.0,  Doubtful: 1.2, Questionable: 0.5 },
    LB:  { Out: 2.0,  Doubtful: 1.2, Questionable: 0.5 },
    CB1: { Out: 2.5,  Doubtful: 1.5, Questionable: 0.8 },
    CB2: { Out: 1.5,  Doubtful: 0.8, Questionable: 0.3 },
    S:   { Out: 1.5,  Doubtful: 1.0, Questionable: 0.5 },
};

const POSITIONS = Object.keys(POSITION_IMPACTS);
const STATUSES: InjuryStatus[] = ['Out', 'Doubtful', 'Questionable'];

const STATUS_COLOR: Record<InjuryStatus, string> = {
    Out:          'bg-red-700 text-red-100',
    Doubtful:     'bg-orange-700 text-orange-100',
    Questionable: 'bg-yellow-700 text-yellow-100',
};

interface InjuryEntry { position: string; status: InjuryStatus; impact: number; }

function totalImpact(entries: InjuryEntry[]) {
    return Math.round(entries.reduce((s, e) => s + e.impact, 0) * 10) / 10;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
    return (
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 mb-2 border-t border-gray-700 pt-3">
            {text}
        </p>
    );
}

interface StatRowProps {
    label: string;
    homeVal: number;
    awayVal: number;
    decimals?: number;
    unit?: string;
}

function StatRow({ label, homeVal, awayVal, decimals = 1, unit = '' }: StatRowProps) {
    const fmt      = (v: number) => v.toFixed(decimals) + unit;
    const homeWins = homeVal > awayVal;
    const awayWins = awayVal > homeVal;
    return (
        <div className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
      <span className={`text-sm w-24 text-right font-mono ${homeWins ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
        {fmt(homeVal)}
      </span>
            <span className="text-gray-400 text-xs w-32 text-center">{label}</span>
            <span className={`text-sm w-24 text-left font-mono ${awayWins ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
        {fmt(awayVal)}
      </span>
        </div>
    );
}

function InjuryBuilder({ teamName, entries, onAdd, onRemove, color }: {
    teamName: string;
    entries: InjuryEntry[];
    onAdd: (e: InjuryEntry) => void;
    onRemove: (i: number) => void;
    color: 'green' | 'blue';
}) {
    const [pos,    setPos]    = useState(POSITIONS[0]);
    const [status, setStatus] = useState<InjuryStatus>('Out');

    const headingColor = color === 'green' ? 'text-green-300' : 'text-blue-300';
    const addColor     = color === 'green'
        ? 'bg-green-700 hover:bg-green-600 text-white'
        : 'bg-blue-700 hover:bg-blue-600 text-white';

    const total = totalImpact(entries);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${headingColor}`}>{teamName}</p>
                {total > 0 && (
                    <p className="text-[10px] text-gray-400">
                        Total: <span className="text-red-400 font-bold">-{total} pts</span>
                    </p>
                )}
            </div>
            <div className="flex gap-1 items-center">
                <select
                    value={pos}
                    onChange={e => setPos(e.target.value)}
                    className="bg-gray-700 text-white text-xs rounded px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value as InjuryStatus)}
                    className="bg-gray-700 text-white text-xs rounded px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                    onClick={() => onAdd({ position: pos, status, impact: POSITION_IMPACTS[pos][status] })}
                    className={`text-xs px-2 py-1 rounded font-semibold shrink-0 ${addColor}`}
                >
                    + Add
                </button>
            </div>
            <p className="text-[10px] text-gray-600 italic">
                {pos} {status} = -{POSITION_IMPACTS[pos][status]} pts
            </p>
            {entries.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {entries.map((e, i) => (
                        <span
                            key={i}
                            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[e.status]}`}
                        >
              {e.position} · {e.status}
                            <button onClick={() => onRemove(i)} className="ml-0.5 opacity-70 hover:opacity-100 font-bold">x</button>
            </span>
                    ))}
                </div>
            ) : (
                <p className="text-[10px] text-gray-600 italic">No injuries added.</p>
            )}
        </div>
    );
}

function SingleSlider({ label, val, min, max, step = 1, unit = '', onChange }: {
    label: string; val: number; min: number; max: number;
    step?: number; unit?: string; onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center gap-3 py-1">
            <span className="text-xs text-gray-400 w-28 text-right shrink-0">{label}</span>
            <input
                type="range" min={min} max={max} step={step} value={val}
                onChange={e => onChange(Number(e.target.value))}
                className="flex-1 accent-green-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-green-300 w-12 tabular-nums">{val}{unit}</span>
        </div>
    );
}

// ─── Default factors ──────────────────────────────────────────────────────────

const DEFAULT_FACTORS: Factors = {
    homeEpa: 0, awayEpa: 0,
    homeRedZone: 0, awayRedZone: 0,
    homePlays: 0, awayPlays: 0,
    homePressure: 0, awayPressure: 0,
    homePointsAllowed: 0, awayPointsAllowed: 0,
    homeH2HWins: 0, awayH2HWins: 0,
    homeInjury: 0, awayInjury: 0,
    stadiumType: 'outdoor',
    temp: 65,
    wind: 8,
    precipitation: 'none',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GamePredictionPanel({ game, onPrediction }: Props) {
    const [factors,      setFactors]      = useState<Factors>(DEFAULT_FACTORS);
    const [homeInjuries, setHomeInjuries] = useState<InjuryEntry[]>([]);
    const [awayInjuries, setAwayInjuries] = useState<InjuryEntry[]>([]);
    const [loading,      setLoading]      = useState(false);
    const [statsError,   setStatsError]   = useState<string | null>(null);

    useEffect(() => {
        if (!game?.id) return;
        let cancelled = false;

        setLoading(true);
        setStatsError(null);
        setHomeInjuries([]);
        setAwayInjuries([]);

        fetchGameStats(game.id)
            .then((stats) => {
                if (cancelled) return;
                setFactors(prev => ({
                    ...prev,
                    homeEpa:           stats.home.epa,
                    awayEpa:           stats.away.epa,
                    homeRedZone:       stats.home.redZonePct,
                    awayRedZone:       stats.away.redZonePct,
                    homePlays:         stats.home.playsPerGame,
                    awayPlays:         stats.away.playsPerGame,
                    homePressure:      stats.home.pressureRate,
                    awayPressure:      stats.away.pressureRate,
                    homePointsAllowed: stats.home.pointsAllowed,
                    awayPointsAllowed: stats.away.pointsAllowed,
                    homeH2HWins:       stats.homeH2HWins,
                    awayH2HWins:       stats.awayH2HWins,
                    homeInjury:        0,
                    awayInjury:        0,
                    stadiumType:       game.indoor ? 'dome' : 'outdoor',
                    temp:              game.weatherTemp > 0 ? game.weatherTemp : 65,
                    wind:              8,
                    precipitation:     'none',
                }));
            })
            .catch((err: Error) => {
                if (cancelled) return;
                console.error('[GamePredictionPanel] fetchGameStats error:', err);
                setStatsError('Could not load stats. Using defaults.');
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [game.id]);

    function setFactor<K extends keyof Factors>(key: K, val: Factors[K]) {
        setFactors(prev => ({ ...prev, [key]: val }));
    }

    function addHomeInjury(e: InjuryEntry) {
        const next = [...homeInjuries, e];
        setHomeInjuries(next);
        setFactor('homeInjury', totalImpact(next));
    }
    function removeHomeInjury(i: number) {
        const next = homeInjuries.filter((_, idx) => idx !== i);
        setHomeInjuries(next);
        setFactor('homeInjury', totalImpact(next));
    }
    function addAwayInjury(e: InjuryEntry) {
        const next = [...awayInjuries, e];
        setAwayInjuries(next);
        setFactor('awayInjury', totalImpact(next));
    }
    function removeAwayInjury(i: number) {
        const next = awayInjuries.filter((_, idx) => idx !== i);
        setAwayInjuries(next);
        setFactor('awayInjury', totalImpact(next));
    }

    return (
        <div className="bg-gray-800 rounded-xl p-4">

            {/* Column headers */}
            <div className="flex justify-between text-xs font-semibold mb-3">
                <span className="text-blue-400">{game.teamBAbbrev} (Home)</span>
                <span className="text-gray-500 uppercase tracking-wide">Season Stats</span>
                <span className="text-orange-400">{game.teamAAbbrev} (Away)</span>
            </div>

            {/* Season Stats */}
            {loading ? (
                <div className="flex items-center justify-center py-4 gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Loading stats...</span>
                </div>
            ) : statsError ? (
                <p className="text-yellow-500 text-xs text-center py-2">{statsError}</p>
            ) : (
                <div className="flex flex-col">
                    <StatRow label="EPA / Play"      homeVal={factors.homeEpa}           awayVal={factors.awayEpa} />
                    <StatRow label="Red Zone %"      homeVal={factors.homeRedZone}       awayVal={factors.awayRedZone}       unit="%" />
                    <StatRow label="Plays / Game"    homeVal={factors.homePlays}         awayVal={factors.awayPlays}         decimals={0} />
                    <StatRow label="Pressure Rate"   homeVal={factors.homePressure}      awayVal={factors.awayPressure}      decimals={0} />
                    <StatRow label="Pts Allowed"     homeVal={factors.homePointsAllowed} awayVal={factors.awayPointsAllowed} />
                </div>
            )}

            {/* Injury Report */}
            <SectionLabel text="Injury Report" />
            <div className="grid grid-cols-2 gap-4 mt-1">
                <InjuryBuilder
                    teamName={game.teamB}
                    entries={homeInjuries}
                    color="green"
                    onAdd={addHomeInjury}
                    onRemove={removeHomeInjury}
                />
                <InjuryBuilder
                    teamName={game.teamA}
                    entries={awayInjuries}
                    color="blue"
                    onAdd={addAwayInjury}
                    onRemove={removeAwayInjury}
                />
            </div>

            {/* Game Conditions */}
            <SectionLabel text="Game Conditions" />

            <div className="flex items-center gap-3 py-1">
                <span className="text-xs text-gray-400 w-28 text-right shrink-0">Stadium</span>
                <select
                    value={factors.stadiumType}
                    onChange={e => setFactor('stadiumType', e.target.value as Stadium)}
                    className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                    <option value="outdoor">Outdoor</option>
                    <option value="dome">Dome</option>
                    <option value="neutral">Neutral</option>
                </select>
            </div>

            {factors.stadiumType !== 'dome' && (
                <>
                    <SingleSlider
                        label="Temp F"
                        val={factors.temp}
                        min={10} max={105} step={1} unit="°"
                        onChange={v => setFactor('temp', v)}
                    />
                    <SingleSlider
                        label="Wind MPH"
                        val={factors.wind}
                        min={0} max={50} step={1}
                        onChange={v => setFactor('wind', v)}
                    />
                    <div className="flex items-center gap-3 py-1">
                        <span className="text-xs text-gray-400 w-28 text-right shrink-0">Precipitation</span>
                        <select
                            value={factors.precipitation}
                            onChange={e => setFactor('precipitation', e.target.value as Precip)}
                            className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        >
                            <option value="none">None</option>
                            <option value="light">Light Rain</option>
                            <option value="heavy">Heavy Rain</option>
                            <option value="snow">Snow</option>
                            <option value="blizzard">Blizzard</option>
                        </select>
                    </div>
                </>
            )}

            <button
                type="button"
                onClick={() => onPrediction(factors)}
                disabled={loading}
                className="mt-5 w-full py-3 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
                {loading ? 'Loading Stats...' : 'Generate Prediction'}
            </button>

        </div>
    );
}
