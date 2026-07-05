"""FastAPI wrapper around the Connect Four game engine.

Exposes the board, win detection, and Minimax AI (with alpha-beta
analytics) as a JSON API for the React frontend.

Run with:  python app.py   (serves on http://127.0.0.1:8001)
"""

import sys

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from board import Board
from win_checker import WinChecker
from minimax_agent import MinimaxAgent
from logger import Logger

# Logger.report() prints emoji; Windows consoles default to cp1252 and
# would raise UnicodeEncodeError mid-request without this.
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PLAYER_PIECE = "X"
AI_PIECE = "O"

STATUS_ONGOING = "ongoing"
STATUS_PLAYER_WINS = "player_wins"
STATUS_AI_WINS = "ai_wins"
STATUS_DRAW = "draw"

app = FastAPI(title="Connect Four — Minimax API")

# The Vite dev server runs on another port, so the browser needs CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GameState:
    """One active game: board, rules, AI agent, and analytics logger."""

    def __init__(self, depth=5):
        self.board = Board()
        self.checker = WinChecker(self.board)
        self.logger = Logger()
        self.agent = MinimaxAgent(
            piece=AI_PIECE,
            opponent_piece=PLAYER_PIECE,
            logger=self.logger,
            depth=depth,
        )
        self.depth = depth
        self.status = STATUS_ONGOING


game = GameState()


class MoveRequest(BaseModel):
    column: int = Field(..., ge=0, description="0-indexed column the player drops into")


def serialize_grid(board):
    return [row[:] for row in board.grid]


def build_analytics(logger):
    saved = logger.nodes_without_pruning - logger.nodes_with_pruning
    gain = (saved / logger.nodes_without_pruning * 100) if logger.nodes_without_pruning else 0.0
    return {
        "nodes_with_pruning": logger.nodes_with_pruning,
        "nodes_without_pruning": logger.nodes_without_pruning,
        "nodes_saved": saved,
        "efficiency_gain": round(gain, 1),
    }


@app.get("/")
@app.get("/api")
@app.get("/api/")
def health():
    return {"ok": True, "service": "connect-four-api"}


@app.get("/start")
@app.get("/api/start")
def start(depth: int = Query(5, ge=1, le=6)):
    """Reset to a fresh board. Optional ?depth= controls AI search depth."""
    global game
    game = GameState(depth=depth)
    return {
        "grid": serialize_grid(game.board),
        "rows": game.board.rows,
        "cols": game.board.cols,
        "depth": depth,
        "status": game.status,
    }


@app.post("/move")
@app.post("/api/move")
def move(req: MoveRequest):
    """Apply the player's move, then let the AI respond.

    Returns the updated grid, the AI's column choice, game status, and
    the pruning-vs-no-pruning analytics for the AI's search.
    """
    if game.status != STATUS_ONGOING:
        raise HTTPException(status_code=409, detail="Game is over. Call /start for a new game.")
    if not game.board.is_valid_column(req.column):
        raise HTTPException(status_code=400, detail="Column is full or out of range.")

    player_row = game.board.drop_piece(req.column, PLAYER_PIECE)

    ai_column = None
    ai_row = None
    analytics = None

    if game.checker.check_win(PLAYER_PIECE):
        game.status = STATUS_PLAYER_WINS
    elif game.checker.is_draw():
        game.status = STATUS_DRAW
    else:
        ai_column = game.agent.get_best_move(game.board, game.checker)
        ai_row = game.board.drop_piece(ai_column, AI_PIECE)
        analytics = build_analytics(game.logger)

        if game.checker.check_win(AI_PIECE):
            game.status = STATUS_AI_WINS
        elif game.checker.is_draw():
            game.status = STATUS_DRAW

    return {
        "grid": serialize_grid(game.board),
        "player_column": req.column,
        "player_row": player_row,
        "ai_column": ai_column,
        "ai_row": ai_row,
        "status": game.status,
        "analytics": analytics,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8001)
