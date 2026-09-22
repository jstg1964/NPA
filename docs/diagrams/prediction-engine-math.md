Prediction Engine — Math & Logic Breakdown

1. Inputs
   Team offensive stats

Team defensive stats

Efficiency metrics

Spread

Moneyline

Total

Historical matchup data

2. Core Formula Components
   2.1 Offensive vs Defensive Efficiency
   Code
   offenseScore = offense.passYards * 0.35
   - offense.rushYards * 0.25
   - offense.pointsPerGame * 0.40

defenseScore = defense.pointsAllowed * -0.50

- defense.yardsAllowed * -0.30
- defense.turnovers * 0.20
  2.2 Team Strength Index
  Code
  teamStrength = offenseScore + defenseScore
  2.3 Spread Adjustment
  Code
  spreadImpact = (spread * -1) * 0.75
  2.4 Moneyline Probability Conversion
  Moneyline → implied probability:

Code
if moneyline < 0:
prob = (-moneyline) / ((-moneyline) + 100)
else:
prob = 100 / (moneyline + 100)
2.5 Final Confidence Score
Code
confidence = normalize(
teamStrengthDiff * 0.6 +
spreadImpact * 0.2 +
moneylineProb * 0.2
)
2.6 Winner Selection
Code
winner = (teamStrength_home + spreadImpact_home) >
(teamStrength_away + spreadImpact_away) 3. Explanation Generation
The model produces human-readable explanations using:

Highest contributing stat

Efficiency differences

Spread influence

Moneyline probability

Historical matchup trends

Example:

“Bills have a +14.2 offensive efficiency advantage and a stronger pass defense. Spread impact favors Buffalo by 3.5 points.”
