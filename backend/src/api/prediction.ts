import { Router, Request, Response } from 'express';
import { generatePrediction } from '../services/predictionService';

const router = Router();

router.post('/predict/:gameId', async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.gameId, 10);

  if (isNaN(gameId)) {
    return res.status(400).json({ error: 'Invalid gameId — must be a number' });
  }

  const factors = req.body;

  if (!factors || Object.keys(factors).length === 0) {
    return res.status(400).json({ error: 'Missing factors in request body' });
  }

  try {
    const result = await generatePrediction(gameId, factors);
    res.json(result);
  } catch (err: any) {
    console.error('[prediction] Error generating prediction:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
