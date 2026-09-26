import { Router, Request, Response } from 'express';
import { getAllGames, fetchGameStats } from '../services/gameService';

const router = Router();

router.get('/games', async (req: Request, res: Response) => {
  const week = Number(req.query['week'] ?? 3);
  if (isNaN(week) || week < 1 || week > 22) {
    res.status(400).json({ error: 'Invalid week. Must be 1–22.' });
    return;
  }
  try {
    const games = await getAllGames(week);
    res.json(games);
  } catch (err: any) {
    console.error('[games route] error:', err.message);
    res.status(500).json({ error: 'Failed to load games' });
  }
});

router.get('/stats/:gameId', async (req: Request, res: Response) => {
  try {
    const stats = await fetchGameStats(req.params.gameId);
    res.json(stats);
  } catch (err: any) {
    console.error('[stats route] error:', err.message);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
