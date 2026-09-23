import express from "express";
import { generatePrediction } from "../services/predictionService";

const router = express.Router();

router.get("/predict/:gameId", async (req, res) => {
  const { gameId } = req.params;

  try {
    const result = await generatePrediction(gameId);
    return res.json(result);
  } catch (err) {
    console.error("Prediction route error:", err);
    return res.status(500).json({ error: "Prediction route failed" });
  }
});

export default router;
