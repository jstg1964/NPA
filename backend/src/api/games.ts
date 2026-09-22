// backend/src/api/games.ts

import { Router } from "express";
import { getAllGames } from "../services/gameService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const games = await getAllGames();
    res.json(games);
  } catch (err) {
    console.error("Error loading games:", err);
    res.status(500).json({ error: "Failed to load games" });
  }
});

export default router;
