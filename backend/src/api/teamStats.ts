import { Router } from 'express';
import { fetchTeamPreset } from '../services/teamStatsService';

const router = Router();

// GET /api/team-stats/:abbrev?record=2-1
router.get('/team-stats/:abbrev', async (req, res) => {
  const { abbrev } = req.params;
  const record = (req.query.record as string | undefined) ?? '0-0';

  try {
    const preset = await fetchTeamPreset(abbrev.toUpperCase(), record);
    res.json(preset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
