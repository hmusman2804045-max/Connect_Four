import { AnimatePresence, motion } from "framer-motion";

const COPY = {
  player_wins: {
    title: "VICTORY",
    body: "You out-planned a Minimax search. Impressive.",
    accent: "player",
  },
  ai_wins: {
    title: "AI WINS",
    body: "Alpha-Beta saw it coming moves ago. Rematch?",
    accent: "ai",
  },
  draw: {
    title: "STALEMATE",
    body: "Every column full, nobody connected four.",
    accent: "draw",
  },
};

export default function GameOverlay({ status, onRestart }) {
  const copy = COPY[status];

  return (
    <AnimatePresence>
      {copy && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <motion.div
            className={`overlay-card ${copy.accent}`}
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.9,
            }}
          >
            <h2>{copy.title}</h2>
            <p>{copy.body}</p>
            <button className="btn-neon big" onClick={onRestart}>
              PLAY AGAIN
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
