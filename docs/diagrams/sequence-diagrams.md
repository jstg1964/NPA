NFL Prediction Assistant — Mermaid Sequence Diagrams
These diagrams can be pasted directly into any Mermaid renderer (GitHub, VS Code extension, WebStorm plugin, Mermaid Live Editor).

1. Prediction Request Sequence
   mermaid
   sequenceDiagram
   participant U as User
   participant FE as Frontend (React)
   participant BE as Backend (Express)
   participant PE as Prediction Engine
   participant D as Data Layer (JSON)

   U->>FE: Enter odds & select game
   FE->>BE: POST /predict {gameId, odds}
   BE->>D: Load team stats & game data
   D-->>BE: Return JSON data
   BE->>PE: Run prediction model
   PE-->>BE: Return prediction result
   BE-->>FE: JSON response {winner, confidence, explanation}
   FE-->>U: Render prediction panel

2. Game Listing Sequence
   mermaid
   sequenceDiagram
   participant U as User
   participant FE as Frontend
   participant BE as Backend
   participant D as Data Layer

   U->>FE: Load Game List Page
   FE->>BE: GET /games
   BE->>D: Read games.json
   D-->>BE: Return games list
   BE-->>FE: JSON response
   FE-->>U: Render GameList

3. Team Stats Fetch Sequence
   mermaid
   sequenceDiagram
   participant FE as Frontend
   participant BE as Backend
   participant D as Data Layer

   FE->>BE: GET /teams
   BE->>D: Read teams.json
   D-->>BE: Return team stats
   BE-->>FE: JSON response
   FE: Cache stats for prediction
