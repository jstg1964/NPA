interface Props {
    weather: any;
}

export default function WeatherPanel({ weather }: Props) {
    if (!weather) return null;

    const icon = weather.icon || "sunny";

    return (
        <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded shadow-lg flex items-center gap-4">
            <img
                src={`/weather/${icon}.png`}
                className="w-16 h-16"
                alt="weather icon"
            />

            <div>
                <h2 className="text-xl font-bold mb-2">Weather</h2>
                <p className="text-lg">{weather.description}</p>
                <p className="opacity-80">{weather.temperature}°F</p>
                <p className="opacity-80">{weather.wind} mph wind</p>
            </div>
        </div>
    );
}
