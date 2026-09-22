import { Router } from "express";
import { getAllGames } from "../services/gameService";

const router = Router();

router.get("/", async (req, res) => {
  const games = await getAllGames();
  res.json(games);
});

export default router;
