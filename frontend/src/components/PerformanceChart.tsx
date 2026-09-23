interface Props {
    confidence: number;
}

export default function PerformanceChart({ confidence }: Props) {
    return (
        <div className="bg-gray-800 p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Model Confidence</h2>

            <div className="w-full bg-gray-700 h-4 rounded overflow-hidden">
                <div
                    className="h-full bg-green-400 transition-all duration-700"
                    style={{ width: `${confidence}%` }}
                ></div>
            </div>

            <p className="mt-2 text-lg">{confidence}%</p>
        </div>
    );
}
