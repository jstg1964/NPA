import { useState } from "react";
import PredictionModal from "./PredictionModal";
import { generatePrediction } from "../api/prediction";

interface Props {
    gameId: number | null;
}

export default function GamePredictionPanel({ gameId }: Props) {
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    async function handlePredict() {
        if (!gameId) {
            setError("Please select a game first.");
            setShowModal(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await generatePrediction(gameId);
            setPrediction(data);
            setShowModal(true);
        } catch (err: any) {
            setError(err.message || "Prediction failed");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="game-prediction-panel">
            <button onClick={handlePredict}>Predict This Game</button>

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
