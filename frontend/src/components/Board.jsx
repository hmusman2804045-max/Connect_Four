import { AnimatePresence, motion } from "framer-motion";
import Piece, { CELL } from "./Piece";
import { EMPTY, PLAYER } from "../gameLogic";

/**
 * The 3D game board. Layers, bottom to top:
 *   1. back wall           — dark surface behind the holes
 *   2. pieces layer        — discs fall here, seen through the holes
 *   3. face plate          — cells with punched circular holes
 *   4. halo layer          — neon rings that light up occupied holes
 *   5. column hitboxes     — invisible hover/click targets
 * A ghost preview piece floats above the hovered column.
 */
export default function Board({
  grid,
  onColumnClick,
  hoverCol,
  setHoverCol,
  disabled,
  newKeys,
  winningCells,
}) {
  const rows = grid.length;
  const cols = grid[0].length;
  const winSet = new Set(winningCells.map(([r, c]) => `${r}-${c}`));
  const innerStyle = { width: cols * CELL, height: rows * CELL };

  return (
    <div className="board-stage">
      <div className="board-tilt">
        <div className="preview-track" style={{ width: cols * CELL }}>
          <AnimatePresence>
            {hoverCol !== null && !disabled && (
              <motion.div
                key={hoverCol}
                className="piece player preview"
                style={{ left: hoverCol * CELL }}
                initial={{ opacity: 0, scale: 0.5, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="board-frame"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="board-inner" style={innerStyle}>
            <div className="pieces-layer">
              {grid.map((rowArr, r) =>
                rowArr.map((cell, c) => {
                  if (cell === EMPTY) return null;
                  const key = `${r}-${c}`;
                  return (
                    <Piece
                      key={key}
                      row={r}
                      col={c}
                      owner={cell}
                      isNew={newKeys.has(key)}
                      isWinning={winSet.has(key)}
                    />
                  );
                })
              )}
            </div>

            <div className="plate-layer">
              {Array.from({ length: rows * cols }).map((_, i) => (
                <div key={i} className="hole" />
              ))}
            </div>

            <div className="halo-layer">
              {grid.map((rowArr, r) =>
                rowArr.map((cell, c) => {
                  if (cell === EMPTY) return null;
                  const key = `${r}-${c}`;
                  const winning = winSet.has(key) ? " winning" : "";
                  const side = cell === PLAYER ? "player" : "ai";
                  return (
                    <div
                      key={key}
                      className={`halo ${side}${winning}`}
                      style={{ left: c * CELL, top: r * CELL }}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div
            className="hitbox-layer"
            onMouseLeave={() => setHoverCol(null)}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`col-hitbox${disabled ? " disabled" : ""}`}
                style={{ left: c * CELL, width: CELL }}
                onMouseEnter={() => setHoverCol(c)}
                onClick={() => onColumnClick(c)}
              />
            ))}
          </div>
        </motion.div>

        <div className="board-glow" aria-hidden="true" />
      </div>
    </div>
  );
}
