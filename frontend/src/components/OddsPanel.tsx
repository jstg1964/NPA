interface Props {
    odds: any;
    bettingLines: any;
    onRefresh: () => void;
}

export default function OddsPanel({ odds, bettingLines, onRefresh }: Props) {
    return (
        <div className="bg-gray-800 dark:bg-gray-900 p-6 rounded shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Odds & Betting Lines</h2>

                <button
                    onClick={onRefresh}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
                >
                    Refresh Odds
                </button>
            </div>

            <pre className="bg-gray-900 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(odds, null, 2)}
      </pre>

            <pre className="bg-gray-900 dark:bg-gray-800 p-4 rounded text-sm overflow-auto mt-4">
        {JSON.stringify(bettingLines, null, 2)}
      </pre>
        </div>
    );
}
