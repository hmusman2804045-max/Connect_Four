import { motion } from "framer-motion";
import { PLAYER } from "../gameLogic";

/** Grid stride in px — must match --cell in styles.css. */
export const CELL = 84;

/**
 * One game piece. New pieces fall from above the board with gravity
 * easing and a small bounce on landing; existing pieces render static.
 */
export default function Piece({ row, col, owner, isNew, isWinning }) {
  const cls = [
    "piece",
    owner === PLAYER ? "player" : "ai",
    isWinning ? "winning" : "",
  ]
    .join(" ")
    .trim();

  const style = { left: col * CELL, top: row * CELL };

  if (!isNew) {
    return <div className={cls} style={style} />;
  }

  const fallFrom = -((row + 1) * CELL + 120);
  const bounce = -Math.min(30, 10 + row * 3.5);

  return (
    <motion.div
      className={cls}
      style={style}
      animate={{ y: [fallFrom, 0, bounce, 0] }}
      transition={{
        duration: 0.5 + row * 0.07,
        times: [0, 0.58, 0.8, 1],
        ease: ["easeIn", "easeOut", "easeIn"],
      }}
    />
  );
}
