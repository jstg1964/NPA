interface Props {
    prediction: any | null;
}

export default function ValuePanel({ prediction }: Props) {
    if (!prediction) return null;

    return (
        <div className="value-panel">
            <h2>Value</h2>
            <p>Expected Value: {prediction.ev}</p>
            <p>Odds: {JSON.stringify(prediction.odds)}</p>
            <p>Betting Lines: {JSON.stringify(prediction.bettingLines)}</p>
        </div>
    );
}
