interface Props {
    prediction: any | null;
}

export default function PerformancePanel({ prediction }: Props) {
    if (!prediction) return null;

    return (
        <div className="performance-panel">
            <h2>Performance</h2>
            <p>Model: {prediction.modelName}</p>
            <p>Confidence: {prediction.confidence}%</p>
            <p>Predicted Score: {prediction.predictedScoreA} - {prediction.predictedScoreB}</p>
        </div>
    );
}
