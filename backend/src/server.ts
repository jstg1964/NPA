// backend/src/server.ts

import express from "express";
import cors from "cors";

import gamesRouter from "./api/games";
import predictionRouter from "./api/prediction";

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/games", gamesRouter);
app.use("/api/prediction", predictionRouter);

// START SERVER
const PORT = 4000;

app.listen(PORT, () => {
  console.log("SERVER FILE EXECUTED");
  console.log(`Backend running on http://localhost:${PORT}`);
});
