interface Props {
    injuries: any[];
}

export default function InjuryAlerts({ injuries }: Props) {
    if (!injuries || injuries.length === 0) return null;

    return (
        <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Injury Alerts</h2>

            <ul className="space-y-3">
                {injuries.map((injury, idx) => (
                    <li
                        key={idx}
                        className="p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded"
                    >
                        <p className="font-semibold">{injury.player}</p>
                        <p className="opacity-80">{injury.status}</p>
                        <p className="opacity-80">{injury.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
