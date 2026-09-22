import express from 'express';
import { getModelPerformance } from '../db/resultsRepo';

const router = express.Router();

router.get('/', async (_req, res) => {
  const perf = await getModelPerformance();
  res.json(perf);
});

export default router;
