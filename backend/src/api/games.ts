import express from "express";

const router = express.Router();

const games = [
  { id: 1, teamA: "Patriots", teamB: "Bills", date: "2024-09-07" },
  { id: 2, teamA: "Chiefs", teamB: "49ers", date: "2024-09-07" },
  { id: 3, teamA: "Cowboys", teamB: "Eagles", date: "2024-09-08" }
];

router.get("/games", (req, res) => {
  res.json(games);
});

export default router;
