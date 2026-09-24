import { Router, Request, Response } from 'express';
import { generatePrediction } from '../services/predictionService';

const router = Router();

router.get('/predict/:gameId', async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.gameId, 10);

  if (isNaN(gameId)) {
    return res.status(400).json({ error: 'Invalid gameId — must be a number' });
  }

  try {
    const result = await generatePrediction(gameId);
    res.json(result);
  } catch (err: any) {
    console.error('[prediction] Error generating prediction:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
