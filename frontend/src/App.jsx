import { useCallback, useEffect, useRef, useState } from "react";
import Board from "./components/Board";
import AnalyticsPanel from "./components/AnalyticsPanel";
import GameOverlay from "./components/GameOverlay";
import { startGame, sendMove } from "./api";
import { EMPTY, PLAYER, AI, findLandingRow, findWinningCells } from "./gameLogic";

const ROWS = 6;
const COLS = 7;
const emptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));

export default function App() {
  const [grid, setGrid] = useState(emptyGrid);
  const [status, setStatus] = useState("ongoing");
  const [thinking, setThinking] = useState(false);
  const [depth, setDepth] = useState(5);
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [newKeys, setNewKeys] = useState(() => new Set());
  const [winningCells, setWinningCells] = useState([]);
  const [hoverCol, setHoverCol] = useState(null);
  const [error, setError] = useState(null);
  const busyRef = useRef(false);

  const reset = useCallback(async (searchDepth) => {
    busyRef.current = false;
    setThinking(false);
    setError(null);
    try {
      const data = await startGame(searchDepth);
      setGrid(data.grid);
      setStatus(data.status);
      setAnalytics(null);
      setHistory([]);
      setNewKeys(new Set());
      setWinningCells([]);
    } catch {
      setError("Can't reach the game server — start it with:  python app.py");
    }
  }, []);

  useEffect(() => {
    reset(depth);
  }, [reset, depth]);

  const handleColumnClick = async (col) => {
    if (busyRef.current || thinking || status !== "ongoing") return;
    const row = findLandingRow(grid, col);
    if (row === -1) return;

    busyRef.current = true;
    setError(null);

    // Optimistically drop the player's piece so its animation starts now.
    const prevGrid = grid;
    const optimistic = grid.map((r) => [...r]);
    optimistic[row][col] = PLAYER;
    setGrid(optimistic);
    setNewKeys((prev) => new Set(prev).add(`${row}-${col}`));
    setThinking(true);

    // Let the player's piece finish falling before the AI's piece lands.
    const playerDropMs = 550 + row * 70;

    try {
      const [data] = await Promise.all([
        sendMove(col),
        new Promise((resolve) => setTimeout(resolve, playerDropMs)),
      ]);

      setGrid(data.grid);
      if (data.ai_column !== null && data.ai_row !== null) {
        setNewKeys((prev) =>
          new Set(prev).add(`${data.ai_row}-${data.ai_column}`)
        );
      }
      if (data.analytics) {
        setAnalytics(data.analytics);
        setHistory((h) => [
          ...h,
          { move: h.length + 1, column: data.ai_column, ...data.analytics },
        ]);
      }
      setStatus(data.status);
      if (data.status === "player_wins") {
        setWinningCells(findWinningCells(data.grid, PLAYER));
      } else if (data.status === "ai_wins") {
        setWinningCells(findWinningCells(data.grid, AI));
      }
    } catch (err) {
      setGrid(prevGrid);
      setError(err.message || "Move failed — is the API server running?");
    } finally {
      setThinking(false);
      busyRef.current = false;
    }
  };

  const turnLabel =
    status !== "ongoing" ? "GAME OVER" : thinking ? "AI THINKING" : "YOUR TURN";

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <h1 className="title">
            NEON<span className="title-accent">FOUR</span>
          </h1>
          <p className="subtitle">Connect Four · Minimax vs You</p>
        </div>

        <div className="controls">
          <div className={`turn-chip ${thinking ? "ai" : "player"}`}>
            <span className="turn-dot" />
            {turnLabel}
          </div>
          <label className="depth-control">
            AI DEPTH
            <select
              value={depth}
              disabled={thinking}
              onChange={(e) => setDepth(Number(e.target.value))}
            >
              {[3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-neon" onClick={() => reset(depth)}>
            NEW GAME
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="layout">
        <section className="board-zone">
          <Board
            grid={grid}
            onColumnClick={handleColumnClick}
            hoverCol={hoverCol}
            setHoverCol={setHoverCol}
            disabled={thinking || status !== "ongoing"}
            newKeys={newKeys}
            winningCells={winningCells}
          />
          <p className="hint">
            You play <span className="cyan-text">CYAN</span> — the AI plays{" "}
            <span className="pink-text">PINK</span>. Click a column to drop.
          </p>
        </section>

        <AnalyticsPanel
          analytics={analytics}
          history={history}
          thinking={thinking}
          depth={depth}
        />
      </main>

      <GameOverlay status={status} onRestart={() => reset(depth)} />
    </div>
  );
}
