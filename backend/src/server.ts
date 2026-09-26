import express from "express";
import cors from "cors";

import predictionRouter from "./api/prediction";
import gamesRouter from "./api/games";
import teamStatsRouter from './api/teamStats';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use("/api", predictionRouter);
app.use("/api", gamesRouter);
app.use('/api', teamStatsRouter);

app.get("/", (req, res) => {
  res.send("NFL Betting Assistant Backend Running");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
