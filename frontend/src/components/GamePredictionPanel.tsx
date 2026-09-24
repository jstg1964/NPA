import { useState, useCallback } from 'react';
import PredictionModal from './PredictionModal';
import { generatePrediction } from '../api/prediction';

// ─── Types ────────────────────────────────────────────────────────────────────

type PrecipitationType = 'none' | 'light' | 'heavy' | 'snow' | 'blizzard';

type WeatherCondition =
    | 'sunny' | 'partly_cloudy' | 'overcast' | 'windy'
    | 'rainy' | 'stormy' | 'cold' | 'snow' | 'blizzard' | 'fog';

interface WeatherPreset {
    key:           WeatherCondition;
    label:         string;
    wind:          number;
    precipitation: PrecipitationType;
}

// ─── Weather presets ──────────────────────────────────────────────────────────

const WEATHER_CONDITIONS: WeatherPreset[] = [
    { key: 'sunny',         label: '☀️  Sunny / Clear',   wind: 5,  precipitation: 'none'     },
    { key: 'partly_cloudy', label: '🌤  Partly Cloudy',    wind: 8,  precipitation: 'none'     },
    { key: 'overcast',      label: '☁️  Overcast',         wind: 10, precipitation: 'none'     },
    { key: 'windy',         label: '🌬  Windy',            wind: 28, precipitation: 'none'     },
    { key: 'rainy',         label: '🌧  Rainy',            wind: 12, precipitation: 'light'    },
    { key: 'stormy',        label: '⛈  Stormy',           wind: 26, precipitation: 'heavy'    },
    { key: 'cold',          label: '🥶  Cold / Freezing',  wind: 18, precipitation: 'none'     },
    { key: 'snow',          label: '🌨  Snow',             wind: 15, precipitation: 'snow'     },
    { key: 'blizzard',      label: '🌪  Blizzard',         wind: 38, precipitation: 'blizzard' },
    { key: 'fog',           label: '🌫  Foggy / Damp',     wind: 6,  precipitation: 'light'    },
];

// ─── Injury config ────────────────────────────────────────────────────────────

const INJURY_WEIGHTS: Record<string, number> = {
    QB_OUT: 4.5, QB_QUESTIONABLE: 2.0,
    WR1_OUT: 1.8, RB1_OUT: 1.2, LT_OUT: 1.0, CB1_OUT: 0.8,
};

const INJURY_LABELS: Record<string, string> = {
    QB_OUT: 'QB Out', QB_QUESTIONABLE: 'QB Questionable',
    WR1_OUT: 'WR1 Out', RB1_OUT: 'RB1 Out', LT_OUT: 'LT Out', CB1_OUT: 'CB1 Out',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Slider({
                    label, min, max, step = 0.01, value, onChange, format,
                }: {
    label: string; min: number; max: number; step?: number;
    value: number; onChange: (v: number) => void; format?: (v: number) => string;
}) {
    return (
        <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>{label}</span>
                <span className="font-mono text-white">{format ? format(value) : value}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full accent-green-500"
            />
        </div>
    );
}

function InjuryPanel({
                         label, checked, onChange,
                     }: { label: string; checked: string[]; onChange: (v: string[]) => void }) {
    const toggle = (key: string) =>
        onChange(checked.includes(key) ? checked.filter(k => k !== key) : [...checked, key]);
    const impact = checked.reduce((s, k) => s + (INJURY_WEIGHTS[k] ?? 0), 0);
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm font-semibold mb-2">
                <span>{label}</span>
                {impact > 0 && <span className="text-red-400">−{impact.toFixed(1)} pts</span>}
            </div>
            <div className="grid grid-cols-2 gap-1">
                {Object.keys(INJURY_WEIGHTS).map(key => (
                    <label key={key} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={checked.includes(key)}
                            onChange={() => toggle(key)}
                            className="accent-red-500"
                        />
                        {INJURY_LABELS[key]}
                    </label>
                ))}
            </div>
        </div>
    );
}

// ─── Section header with team color badges ────────────────────────────────────

function TeamBadges({ teamA, teamB }: { teamA: string; teamB: string }) {
    return (
        <div className="flex gap-2 mb-2">
      <span className="text-xs bg-green-700 text-white rounded px-2 py-0.5 font-semibold">
        🏠 {teamA}
      </span>
            <span className="text-xs bg-blue-700 text-white rounded px-2 py-0.5 font-semibold">
        ✈️ {teamB}
      </span>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
    gameId:       number | null;
    teamA:        string;
    teamB:        string;
    onPrediction: (p: any) => void;
}

export default function GamePredictionPanel({ gameId, teamA, teamB, onPrediction }: Props) {

    // Offensive efficiency
    const [homeEPA,      setHomeEPA]      = useState(0.05);
    const [awayEPA,      setAwayEPA]      = useState(0.02);
    const [homeRedZone,  setHomeRedZone]  = useState(58);
    const [awayRedZone,  setAwayRedZone]  = useState(55);

    // Defensive rating
    const [homePressure, setHomePressure] = useState(28);
    const [awayPressure, setAwayPressure] = useState(26);
    const [homePA,       setHomePA]       = useState(22);
    const [awayPA,       setAwayPA]       = useState(23);

    // Pace
    const [homePlays,    setHomePlays]    = useState(66);
    const [awayPlays,    setAwayPlays]    = useState(64);

    // Momentum
    const [homeMomentum, setHomeMomentum] = useState<'3-0'|'2-1'|'1-2'|'0-3'>('2-1');
    const [awayMomentum, setAwayMomentum] = useState<'3-0'|'2-1'|'1-2'|'0-3'>('1-2');

    // Stadium
    const [stadiumType,  setStadiumType]  = useState<'outdoor'|'dome'|'neutral'>('outdoor');

    // Weather
    const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('sunny');
    const [temp,             setTemp]             = useState<number>(65);

    // Injuries
    const [homeInjuries, setHomeInjuries] = useState<string[]>([]);
    const [awayInjuries, setAwayInjuries] = useState<string[]>([]);

    // H2H
    const [homeH2H,      setHomeH2H]      = useState(12);
    const [awayH2H,      setAwayH2H]      = useState(10);
    const [isDivisional, setIsDivisional] = useState(false);

    // UI state
    const [prediction,   setPrediction]   = useState<any>(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState<string | null>(null);
    const [showModal,    setShowModal]    = useState(false);

    // ── Derived ─────────────────────────────────────────────────────────────────

    const homeInjuryImpact = homeInjuries.reduce((s, k) => s + (INJURY_WEIGHTS[k] ?? 0), 0);
    const awayInjuryImpact = awayInjuries.reduce((s, k) => s + (INJURY_WEIGHTS[k] ?? 0), 0);
    const currentWeather   = WEATHER_CONDITIONS.find(w => w.key === weatherCondition)!;

    const MOMENTUM_MAP: Record<string, number> = {
        '3-0': 2, '2-1': 0.5, '1-2': -0.5, '0-3': -2,
    };
    const RAIN_PENALTY: Record<PrecipitationType, number> = {
        none: 0, light: 1.5, heavy: 3.5, snow: 4, blizzard: 7,
    };

    // ── Live score preview ───────────────────────────────────────────────────────

    const livePreview = useCallback(() => {
        let h = 23, a = 23;
        h += homeEPA * 27;                   a += awayEPA * 27;
        h -= (awayPressure - 26) * 0.15;    a -= (homePressure - 26) * 0.15;
        h = h * 0.6 + (42 - awayPA) * 0.4;  a = a * 0.6 + (42 - homePA) * 0.4;
        h *= homeRedZone / 58;              a *= awayRedZone / 58;
        h *= homePlays / 66;                a *= awayPlays / 66;
        if (stadiumType !== 'neutral') h += 2.5;
        if (stadiumType === 'outdoor') {
            const { wind, precipitation } = currentWeather;
            if (wind > 15) { h -= (wind - 15) * 0.125; a -= (wind - 15) * 0.15; }
            if (temp < 25) { h -= (25 - temp) * 0.08;  a -= (25 - temp) * 0.10; }
            if (temp > 85) { h -= (temp - 85) * 0.05;  a -= (temp - 85) * 0.04; }
            h -= RAIN_PENALTY[precipitation];
            a -= RAIN_PENALTY[precipitation] * 1.1;
        }
        h -= homeInjuryImpact; a -= awayInjuryImpact;
        h += MOMENTUM_MAP[homeMomentum] ?? 0;
        a += MOMENTUM_MAP[awayMomentum] ?? 0;
        return {
            h: Math.max(7, Math.min(52, h)),
            a: Math.max(7, Math.min(52, a)),
        };
    }, [homeEPA, awayEPA, homeRedZone, awayRedZone, homePressure, awayPressure,
        homePA, awayPA, homePlays, awayPlays, stadiumType, temp, currentWeather,
        homeInjuryImpact, awayInjuryImpact, homeMomentum, awayMomentum,
        MOMENTUM_MAP, RAIN_PENALTY]);

    const preview = livePreview();

    // ── Generate prediction ──────────────────────────────────────────────────────

    const handlePredict = async () => {
        if (!gameId) { setError('Please select a game first.'); setShowModal(true); return; }
        setLoading(true); setError(null);
        try {
            const data = await generatePrediction(gameId);
            setPrediction(data); onPrediction(data); setShowModal(true);
        } catch (err: any) {
            setError(err.message || 'Prediction failed'); setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const momentumOptions: Array<'3-0'|'2-1'|'1-2'|'0-3'> = ['3-0','2-1','1-2','0-3'];

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <div className="bg-gray-900 rounded-xl p-4 text-white space-y-4">

            {/* Live score preview */}
            <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Live Score Preview</p>
                <p className="text-2xl font-bold tracking-wider">
                    <span className="text-green-400">{preview.h.toFixed(1)}</span>
                    <span className="text-gray-500 mx-2">—</span>
                    <span className="text-blue-400">{preview.a.toFixed(1)}</span>
                </p>
                <div className="flex justify-center gap-6 mt-1 text-xs text-gray-500">
                    <span className="text-green-400">🏠 {teamA}</span>
                    <span className="text-blue-400">✈️ {teamB}</span>
                </div>
            </div>

            {/* Stadium type */}
            <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">Stadium Type</p>
                <div className="flex gap-2">
                    {(['outdoor', 'dome', 'neutral'] as const).map(s => (
                        <button key={s} onClick={() => setStadiumType(s)}
                                className={`flex-1 py-1 rounded text-xs font-semibold capitalize transition
                ${stadiumType === s ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Weather */}
            {stadiumType === 'outdoor' && (
                <div className="border border-gray-700 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-widest">🌤 Weather</p>
                    <div className="flex gap-3 items-start">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Condition</p>
                            <select
                                value={weatherCondition}
                                onChange={e => setWeatherCondition(e.target.value as WeatherCondition)}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {WEATHER_CONDITIONS.map(w => (
                                    <option key={w.key} value={w.key}>{w.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-24">
                            <p className="text-xs text-gray-500 mb-1">Temp (°F)</p>
                            <input
                                type="number" min={-20} max={110} value={temp}
                                onChange={e => setTemp(Number(e.target.value))}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm text-center
                           focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>💨 {currentWeather.wind} mph wind</span>
                        <span>🌧 {currentWeather.precipitation} precipitation</span>
                    </div>
                </div>
            )}

            {/* Offensive Efficiency */}
            <div className="border border-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-widest">⚡ Offensive Efficiency</p>
                <TeamBadges teamA={teamA} teamB={teamB} />
                <Slider label={`${teamA} EPA/play`} min={-0.3} max={0.3} step={0.01} value={homeEPA}
                        onChange={setHomeEPA} format={v => v.toFixed(2)} />
                <Slider label={`${teamB} EPA/play`} min={-0.3} max={0.3} step={0.01} value={awayEPA}
                        onChange={setAwayEPA} format={v => v.toFixed(2)} />
                <Slider label={`${teamA} Red Zone %`} min={45} max={75} step={1} value={homeRedZone}
                        onChange={setHomeRedZone} format={v => `${v}%`} />
                <Slider label={`${teamB} Red Zone %`} min={45} max={75} step={1} value={awayRedZone}
                        onChange={setAwayRedZone} format={v => `${v}%`} />
            </div>

            {/* Defensive Rating */}
            <div className="border border-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-widest">🛡 Defensive Rating</p>
                <TeamBadges teamA={teamA} teamB={teamB} />
                <Slider label={`${teamA} Pressure Rate %`} min={15} max={50} step={1} value={homePressure}
                        onChange={setHomePressure} format={v => `${v}%`} />
                <Slider label={`${teamB} Pressure Rate %`} min={15} max={50} step={1} value={awayPressure}
                        onChange={setAwayPressure} format={v => `${v}%`} />
                <Slider label={`${teamA} Pts Allowed/G`} min={14} max={35} step={1} value={homePA}
                        onChange={setHomePA} format={v => `${v}`} />
                <Slider label={`${teamB} Pts Allowed/G`} min={14} max={35} step={1} value={awayPA}
                        onChange={setAwayPA} format={v => `${v}`} />
            </div>

            {/* Pace */}
            <div className="border border-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-widest">📈 Pace</p>
                <TeamBadges teamA={teamA} teamB={teamB} />
                <Slider label={`${teamA} Plays/Game`} min={58} max={78} step={1} value={homePlays}
                        onChange={setHomePlays} format={v => `${v}`} />
                <Slider label={`${teamB} Plays/Game`} min={58} max={78} step={1} value={awayPlays}
                        onChange={setAwayPlays} format={v => `${v}`} />
            </div>

            {/* Momentum */}
            <div className="border border-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">🔥 Momentum (Last 3 Weeks)</p>
                <div className="mb-2">
                    <p className="text-xs text-green-400 font-semibold mb-1">🏠 {teamA}</p>
                    <div className="flex gap-1">
                        {momentumOptions.map(m => (
                            <button key={m} onClick={() => setHomeMomentum(m)}
                                    className={`flex-1 py-1 rounded text-xs font-mono transition
                  ${homeMomentum === m ? 'bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs text-blue-400 font-semibold mb-1">✈️ {teamB}</p>
                    <div className="flex gap-1">
                        {momentumOptions.map(m => (
                            <button key={m} onClick={() => setAwayMomentum(m)}
                                    className={`flex-1 py-1 rounded text-xs font-mono transition
                  ${awayMomentum === m ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Injuries */}
            <div className="border border-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-widest">🩹 Injury Report</p>
                <InjuryPanel
                    label={`🏠 ${teamA} Injuries`}
                    checked={homeInjuries}
                    onChange={setHomeInjuries}
                />
                <InjuryPanel
                    label={`✈️ ${teamB} Injuries`}
                    checked={awayInjuries}
                    onChange={setAwayInjuries}
                />
            </div>

            {/* H2H */}
            <div className="border border-gray-700 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">📊 Head-to-Head History</p>
                <div className="flex gap-3 mb-2">
                    <div className="flex-1">
                        <p className="text-xs text-green-400 font-semibold mb-1">🏠 {teamA} Wins</p>
                        <input type="number" min={0} value={homeH2H}
                               onChange={e => setHomeH2H(Number(e.target.value))}
                               className="w-full bg-gray-700 rounded p-1 text-sm text-center
                         focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-blue-400 font-semibold mb-1">✈️ {teamB} Wins</p>
                        <input type="number" min={0} value={awayH2H}
                               onChange={e => setAwayH2H(Number(e.target.value))}
                               className="w-full bg-gray-700 rounded p-1 text-sm text-center
                         focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={isDivisional}
                           onChange={e => setIsDivisional(e.target.checked)}
                           className="accent-yellow-500" />
                    Divisional Matchup (compresses spread)
                </label>
            </div>

            {/* Generate button */}
            <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50
          rounded-lg text-white font-bold text-sm tracking-widest uppercase transition"
            >
                {loading
                    ? '⚙️ Running 10,000 Simulations...'
                    : `🏈 Predict ${teamA} vs ${teamB}`}
            </button>

            {showModal && (
                <PredictionModal
                    prediction={prediction}
                    loading={loading}
                    error={error}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
