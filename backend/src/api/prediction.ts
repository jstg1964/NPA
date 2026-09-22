// backend/src/api/prediction.ts

import { Router } from "express";
import { generatePrediction } from "../services/predictionService";

const router = Router();

// GET /api/prediction/:gameId
router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const prediction = await generatePrediction(gameId);

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    res.json(prediction);
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Failed to generate prediction" });
  }
});

export default router;
