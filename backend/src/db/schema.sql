CREATE TABLE IF NOT EXISTS model_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gameId TEXT,
  modelName TEXT,
  prediction TEXT,
  confidence REAL,
  ev REAL,
  timestamp TEXT,
  teamA TEXT,
  teamB TEXT,
  scoreA INTEGER,
  scoreB INTEGER,
  context TEXT,
  strength TEXT,
  odds TEXT,
  script TEXT
);