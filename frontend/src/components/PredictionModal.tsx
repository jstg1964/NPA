interface Props {
    prediction: any;
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

export default function PredictionModal({
                                            prediction,
                                            loading,
                                            error,
                                            onClose
                                        }: Props) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center animate-fadeIn">
            <div className="bg-gray-800 p-8 rounded shadow-xl w-96 animate-slideUp">

                {loading && <p>Loading prediction...</p>}

                {error && (
                    <>
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-red-600 rounded"
                        >
                            Close
                        </button>
                    </>
                )}

                {!loading && !error && prediction && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Prediction Result</h2>
                        <p className="text-lg mb-2">Winner: {prediction.prediction}</p>
                        <p className="text-lg mb-2">Confidence: {prediction.confidence}%</p>
                        <p className="text-sm opacity-80">{prediction.script}</p>

                        <button
                            onClick={onClose}
                            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                            Close
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
