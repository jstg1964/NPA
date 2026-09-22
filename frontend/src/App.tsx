import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch available games from backend
  useEffect(() => {
    fetch("http://localhost:4000/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch(() => setGames([]));
  }, []);

  const fetchPrediction = async (gameId: string) => {
    setLoading(true);
    setPrediction(null);

    try {
      const res = await fetch(`http://localhost:4000/api/prediction/${gameId}`);
      const data = await res.json();
      setPrediction(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>NFL Betting Assistant</h1>

      <h2>Select a Game</h2>

      <div className="game-list">
        {games.map((g) => (
          <div key={g.id} className="game-card">
            <p><strong>{g.teamA}</strong> vs <strong>{g.teamB}</strong></p>
            <p>Week {g.week}</p>
            <p>{g.date}</p>

            <button
              onClick={() => {
                setSelectedGame(g);
                fetchPrediction(g.id);
              }}
            >
              Predict This Game
            </button>
          </div>
        ))}
      </div>

      {loading && <p>Loading prediction...</p>}

      {prediction && (
        <div className="prediction-box">
          <h2>Prediction</h2>
          <p><strong>Model:</strong> {prediction.modelName}</p>
          <p><strong>Prediction:</strong> {prediction.prediction}</p>
          <p><strong>Confidence:</strong> {prediction.confidence}</p>
          <p><strong>EV:</strong> {prediction.ev}</p>
          <p><strong>Team A:</strong> {prediction.teamA}</p>
          <p><strong>Team B:</strong> {prediction.teamB}</p>
          <p><strong>Predicted Score A:</strong> {prediction.predictedScoreA}</p>
          <p><strong>Predicted Score B:</strong> {prediction.predictedScoreB}</p>
          <p><strong>Script:</strong> {prediction.script}</p>
        </div>
      )}
    </div>
  );
}

export default App;
