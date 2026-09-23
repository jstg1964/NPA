interface Props {
    prediction: any | null;
}

export default function AlertsPanel({ prediction }: Props) {
    if (!prediction) return null;

    return (
        <div className="alerts-panel">
            <h2>Alerts</h2>
            <p>{prediction.script}</p>
            <p>Weather: {JSON.stringify(prediction.weather)}</p>
            <p>Injuries: {JSON.stringify(prediction.injuries)}</p>
        </div>
    );
}
