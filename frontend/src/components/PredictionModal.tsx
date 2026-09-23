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
        <div className="modal">
            <div className="modal-content">

                {loading && <p>Loading prediction...</p>}

                {error && (
                    <>
                        <p style={{ color: "red" }}>{error}</p>
                        <button onClick={onClose}>Close</button>
                    </>
                )}

                {!loading && !error && prediction && (
                    <>
                        <h2>Prediction Result</h2>
                        <p>Winner: {prediction.prediction}</p>
                        <p>Confidence: {prediction.confidence}%</p>
                        <p>{prediction.script}</p>
                        <button onClick={onClose}>Close</button>
                    </>
                )}

            </div>
        </div>
    );
}
