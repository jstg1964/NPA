// src/api/gamePrediction.ts

import { Router } from "express";
import { generateGamePrediction } from "../services/predictionService";

const router = Router();

// GET /api/prediction/:gameId
router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const prediction = await generateGamePrediction(gameId);
    res.json(prediction);
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Failed to generate prediction" });
  }
});

export default router;
