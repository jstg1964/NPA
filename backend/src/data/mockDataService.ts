// backend/src/data/mockDataService.ts

// -----------------------------
// TYPES
// -----------------------------
export interface Game {
  id: string;
  teamA: string;
  teamB: string;
  week: number;
  date: string;
}

export interface GameInfo {
  teamA: string;
  teamB: string;
  location: string;
  weather: string;
  kickoff: string;
}

export interface ModelScore {
  modelName: string;
  prediction: string;
  confidence: number;
  ev: number;
  predictedScoreA: number;
  predictedScoreB: number;
  script: string;
}

export interface Odds {
  spreadA: number;
  spreadB: number;
  moneylineA: number;
  moneylineB: number;
  total: number;
}

export interface TeamStats {
  offenseRank: number;
  defenseRank: number;
}

export interface Weather {
  temp: number;
  wind: number;
  precipitation: number;
}

export interface Injury {
  player: string;
  status: string;
}

export interface BettingLines {
  publicPercentA: number;
  publicPercentB: number;
}

export interface ModelWeights {
  offenseWeight: number;
  defenseWeight: number;
  weatherWeight: number;
  injuriesWeight: number;
  publicWeight: number;
}

// -----------------------------
// MOCK GAME LIST
// -----------------------------
export function getMockGames(): Game[] {
  return [
    {
      id: "1",
      teamA: "Patriots",
      teamB: "Bills",
      week: 1,
      date: "2024-09-07"
    },
    {
      id: "2",
      teamA: "Chiefs",
      teamB: "49ers",
      week: 1,
      date: "2024-09-07"
    }
  ];
}

// -----------------------------
// MOCK GAME INFO
// -----------------------------
const mockGameInfo: Record<string, GameInfo> = {
  "1": {
    teamA: "Patriots",
    teamB: "Bills",
    location: "Foxborough, MA",
    weather: "Clear",
    kickoff: "1:00 PM EST"
  },
  "2": {
    teamA: "Chiefs",
    teamB: "49ers",
    location: "Kansas City, MO",
    weather: "Cloudy",
    kickoff: "4:25 PM EST"
  }
};

export function getMockGameInfo(gameId: string): GameInfo | null {
  return mockGameInfo[gameId] || null;
}

// -----------------------------
// MOCK MODEL SCORE
// -----------------------------
const mockModelScores: Record<string, ModelScore> = {
  "1": {
    modelName: "MockModel v1",
    prediction: "Patriots",
    confidence: 0.62,
    ev: 0.15,
    predictedScoreA: 24,
    predictedScoreB: 20,
    script: "Patriots control time of possession and win late."
  },
  "2": {
    modelName: "MockModel v1",
    prediction: "Chiefs",
    confidence: 0.71,
    ev: 0.22,
    predictedScoreA: 31,
    predictedScoreB: 27,
    script: "Mahomes outduels Purdy in a high‑scoring game."
  }
};

export function getMockModelScore(gameId: string): ModelScore | null {
  return mockModelScores[gameId] || null;
}

// -----------------------------
// MOCK ODDS
// -----------------------------
const mockOdds: Record<string, Odds> = {
  "1": {
    spreadA: -3.5,
    spreadB: +3.5,
    moneylineA: -150,
    moneylineB: +130,
    total: 44.5
  },
  "2": {
    spreadA: -2.5,
    spreadB: +2.5,
    moneylineA: -140,
    moneylineB: +120,
    total: 48.0
  }
};

export function getMockOdds(gameId: string): Odds | null {
  return mockOdds[gameId] || null;
}

// -----------------------------
// MOCK TEAM STATS
// -----------------------------
const mockTeamStats: Record<string, TeamStats> = {
  Patriots: { offenseRank: 18, defenseRank: 12 },
  Bills: { offenseRank: 6, defenseRank: 8 },
  Chiefs: { offenseRank: 1, defenseRank: 15 },
  "49ers": { offenseRank: 3, defenseRank: 5 }
};

export function getMockTeamStats(team: string): TeamStats | null {
  return mockTeamStats[team] || null;
}

// -----------------------------
// MOCK HISTORICAL MATCHUP
// -----------------------------
export function getMockHistoricalMatchup(teamA: string, teamB: string) {
  return {
    teamA,
    teamB,
    last10: {
      winsA: 6,
      winsB: 4,
      avgPointsA: 23,
      avgPointsB: 20
    }
  };
}

// -----------------------------
// MOCK WEATHER
// -----------------------------
const mockWeather: Record<string, Weather> = {
  "1": { temp: 68, wind: 5, precipitation: 0 },
  "2": { temp: 72, wind: 10, precipitation: 10 }
};

export function getMockWeather(gameId: string): Weather | null {
  return mockWeather[gameId] || null;
}

// -----------------------------
// MOCK INJURIES
// -----------------------------
const mockInjuries: Record<string, Injury[]> = {
  "1": [
    { player: "RB Starter", status: "Questionable" },
    { player: "CB Starter", status: "Out" }
  ],
  "2": [
    { player: "WR Starter", status: "Probable" }
  ]
};

export function getMockInjuries(gameId: string): Injury[] {
  return mockInjuries[gameId] || [];
}

// -----------------------------
// MOCK BETTING LINES
// -----------------------------
const mockBettingLines: Record<string, BettingLines> = {
  "1": { publicPercentA: 55, publicPercentB: 45 },
  "2": { publicPercentA: 62, publicPercentB: 38 }
};

export function getMockBettingLines(gameId: string): BettingLines | null {
  return mockBettingLines[gameId] || null;
}

// -----------------------------
// MOCK MODEL WEIGHTS
// -----------------------------
export function getMockModelWeights(): ModelWeights {
  return {
    offenseWeight: 0.4,
    defenseWeight: 0.3,
    weatherWeight: 0.1,
    injuriesWeight: 0.1,
    publicWeight: 0.1
  };
}
