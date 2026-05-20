import './HandCursor.css';

/**
 * HandCursor — SVG cursor pinned to the index fingertip / pinch midpoint.
 *
 * Props:
 *   x, y            — screen coordinates (px)
 *   visible         — whether to render
 *   pinching        — true for closed/pinch state
 *   holding         — true while pinch is engaging (countdown ring)
 *   color           — hex string for currentColor
 *   rippleKey       — incrementing number, triggers ripple animation on change
 *   eraser          — true when the eraser tool is active (draws a sized ring)
 *   eraserSize      — diameter in px for the eraser preview ring
 */
export default function HandCursor({
  x,
  y,
  visible,
  pinching,
  holding,
  color,
  rippleKey,
  eraser = false,
  eraserSize = 0,
}) {
  if (!visible) return null;
  return (
    <div
      className={
        'hand-cursor' +
        (holding ? ' is-holding' : '') +
        (pinching ? ' is-pinching' : '') +
        (eraser ? ' is-eraser' : '')
      }
      style={{
        transform: `translate(${x - 20}px, ${y - 20}px)`,
        color,
      }}
      aria-hidden="true"
    >
      {holding && <span className="hand-cursor__hold-ring" />}

      {eraser ? (
        <span
          className="hand-cursor__eraser-ring"
          style={{
            width: `${eraserSize}px`,
            height: `${eraserSize}px`,
            marginLeft: `${(40 - eraserSize) / 2}px`,
            marginTop: `${(40 - eraserSize) / 2}px`,
          }}
        />
      ) : pinching ? (
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
