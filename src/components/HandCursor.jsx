import './HandCursor.css';

/**
 * HandCursor — SVG cursor pinned to the index fingertip.
 *
 * Props:
 *   x, y          — screen coordinates (px)
 *   visible       — whether to render
 *   pinching      — true for closed/pinch state
 *   color         — hex string for currentColor
 *   rippleKey     — incrementing number, triggers ripple animation when changed
 */
export default function HandCursor({ x, y, visible, pinching, color, rippleKey }) {
  if (!visible) return null;
  return (
    <div
      className="hand-cursor"
      style={{
        transform: `translate(${x - 20}px, ${y - 20}px)`,
        color,
      }}
      aria-hidden="true"
    >
      {pinching ? (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="8" fill="currentColor" fillOpacity="0.85" />
          <circle
            cx="20"
            cy="20"
            r="14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        </svg>
      ) : (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="10" fill="white" fillOpacity="0.6" />
          <circle
            cx="20"
            cy="20"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.2"
            strokeDasharray="3 3"
          />
        </svg>
      )}
      {rippleKey > 0 && (
        <span
          key={rippleKey}
          className="hand-cursor__ripple"
          style={{ borderColor: color }}
        />
      )}
    </div>
  );
}
