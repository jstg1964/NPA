React Component Tree (Detailed)
App
Global layout

Routing

Theme provider

GameListPage
Fetches game list

Displays <GameList />

Handles navigation

GameList
Maps through games

Renders <GameRow /> for each

GameRow
Props:

homeTeam

awayTeam

spread

moneyline

total

Actions:

“Predict” button → navigate to PredictionPage

PredictionPage
Loads selected game

Contains:

<OddsInput />

<PredictionPanel />

<ModelExplanation />

OddsInput
Fields:

Spread

Moneyline

Total

Validation:

Numeric

Required

PredictionPanel
Displays:

Winner

Confidence

Score differential

Probability

ModelExplanation
Shows:

Key factors

Offensive/defensive comparisons

Historical trends
