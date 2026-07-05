import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

const RING_RADIUS = 52;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function EfficiencyRing({ percent }) {
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 140 140" className="ring-svg">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#ff2e88" />
          </linearGradient>
        </defs>
        <circle className="ring-bg" cx="70" cy="70" r={RING_RADIUS} />
        <motion.circle
          className="ring-fg"
          cx="70"
          cy="70"
          r={RING_RADIUS}
          strokeDasharray={RING_CIRC}
          initial={{ strokeDashoffset: RING_CIRC }}
          animate={{ strokeDashoffset: RING_CIRC * (1 - percent / 100) }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="ring-label">
        <span className="ring-value">
          <AnimatedNumber value={Math.round(percent)} />%
        </span>
        <span className="ring-caption">PRUNED</span>
      </div>
    </div>
  );
}

export default function AnalyticsPanel({ analytics, history, thinking, depth }) {
  const hasData = Boolean(analytics);
  const maxNodes = hasData ? Math.max(analytics.nodes_without_pruning, 1) : 1;

  return (
    <aside className="analytics">
      <div className="analytics-head">
        <h2>SEARCH ANALYTICS</h2>
        <span className="depth-badge">DEPTH {depth}</span>
      </div>

      {thinking && (
        <div className="thinking">
          <span className="scan-bar" />
          AI EXPLORING GAME TREE…
        </div>
      )}

      {!hasData && !thinking && (
        <p className="analytics-empty">
          Drop a piece — after each AI move you'll see how many game states
          Minimax explored, with and without alpha-beta pruning.
        </p>
      )}

      {hasData && (
        <>
          <div className="stat-card pink">
            <span className="stat-label">NODES · PLAIN MINIMAX</span>
            <span className="stat-value">
              <AnimatedNumber value={analytics.nodes_without_pruning} />
            </span>
            <div className="bar-track">
              <motion.div
                className="bar-fill pink"
                animate={{
                  width: `${(analytics.nodes_without_pruning / maxNodes) * 100}%`,
                }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="stat-card cyan">
            <span className="stat-label">NODES · ALPHA-BETA</span>
            <span className="stat-value">
              <AnimatedNumber value={analytics.nodes_with_pruning} />
            </span>
            <div className="bar-track">
              <motion.div
                className="bar-fill cyan"
                animate={{
                  width: `${(analytics.nodes_with_pruning / maxNodes) * 100}%`,
                }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="efficiency-card">
            <EfficiencyRing percent={analytics.efficiency_gain} />
            <div className="efficiency-copy">
              <span className="stat-label">EFFICIENCY GAIN</span>
              <p>
                Pruning skipped{" "}
                <strong>
                  <AnimatedNumber value={analytics.nodes_saved} />
                </strong>{" "}
                nodes this move.
              </p>
            </div>
          </div>
        </>
      )}

      {history.length > 0 && (
        <div className="move-log">
          <h3>MOVE LOG</h3>
          <ul>
            <AnimatePresence initial={false}>
              {[...history].reverse().map((entry) => (
                <motion.li
                  key={entry.move}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="log-move">#{entry.move}</span>
                  <span className="log-col">COL {entry.column + 1}</span>
                  <span className="log-gain">-{entry.efficiency_gain}%</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </aside>
  );
}
