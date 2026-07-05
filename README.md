# Connect Four AI with Alpha-Beta Pruning

This project is a web-based Connect Four game featuring an adversarial AI opponent powered by the Minimax algorithm with Alpha-Beta pruning. 

## Features
*   **Intelligent AI Opponent:** Uses Minimax adversarial search to look 5 moves ahead and determine the optimal strategy.
*   **Alpha-Beta Pruning:** Optimizes the search tree by pruning irrelevant branches, achieving an ~80% reduction in nodes visited while guaranteeing the same optimal move.
*   **Custom Heuristics:** The AI evaluates non-terminal board states using a custom scoring function (prioritizing center column control, blocking opponent threats, and building 3-in-a-row traps).
*   **Live Analytics:** Real-time logging of the search tree efficiency, displaying the exact number of nodes saved by Alpha-Beta pruning on every turn.
*   **Full Stack Setup:** A React (Vite) 3D frontend connected to a Python (FastAPI) backend.

## Architecture
*   **Backend:** Python, FastAPI, Uvicorn
*   **Frontend:** React, Vite (Tailwind / Framer Motion for 3D physics)
*   **Deployment:** Vercel (Serverless Functions)

## Running Locally

1. **Start the Backend API:**
   ```bash
   pip install -r requirements.txt
   python app.py
   ```
   The API will run on `http://127.0.0.1:8001`

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## University Assignment Notes
Developed for Artificial Intelligence (CLO 3). See the internal `technical_report.md` for a comprehensive breakdown of the algorithm design, problem statement, and efficiency analysis.
