Prediction Flowchart (Mermaid Format)
You can paste this directly into any Mermaid renderer:

mermaid
flowchart TD
A[User selects game] --> B[User enters odds]
B --> C[POST /predict]
C --> D[Load team stats from JSON]
D --> E[Run prediction engine]
E --> F{Calculate confidence}
F --> G[Generate explanation]
G --> H[Return JSON response]
H --> I[Render PredictionPanel]
Game Listing Flowchart
mermaid
flowchart TD
A[Load games.json] --> B[Render GameList]
B --> C[User clicks a game]
C --> D[Navigate to PredictionPage]
