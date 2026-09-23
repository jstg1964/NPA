import { useState } from "react";
import PredictionModal from "./PredictionModal";
import { generatePrediction } from "../api/prediction";

interface Props {
    gameId: number | null;
    onPrediction: (p: any) => void;
}

export default function GamePredictionPanel({ gameId, onPrediction }: Props) {
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
            onPrediction(data);
            setShowModal(true);
        } catch (err: any) {
            setError(err.message || "Prediction failed");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                onClick={handlePredict}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition"
            >
                Predict This Game
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
