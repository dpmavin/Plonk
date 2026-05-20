// MediaPipe hand topology — 21 landmarks
//   0: wrist · 1-4: thumb · 5-8: index · 9-12: middle · 13-16: ring · 17-20: pinky
const HAND_CONNECTIONS = [
  // thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // middle
  [9, 10], [10, 11], [11, 12],
  // ring
  [13, 14], [14, 15], [15, 16],
  // pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // palm
  [5, 9], [9, 13], [13, 17],
];

/**
 * HandSkeleton — SVG overlay showing the live MediaPipe landmarks.
 * Landmarks are normalized [0..1] so we render into viewBox "0 0 1 1"
 * and let the parent size the SVG to fill its container.
 */
export default function HandSkeleton({ landmarks, visible }) {
  if (!visible || landmarks.length !== 21) return null;
  return (
    <svg
      className="hand-skel"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g className="hand-skel__lines">
        {HAND_CONNECTIONS.map(([a, b], i) => (
          <line
            key={i}
            x1={landmarks[a].x}
            y1={landmarks[a].y}
            x2={landmarks[b].x}
            y2={landmarks[b].y}
          />
        ))}
      </g>
      <g className="hand-skel__dots">
        {landmarks.map((lm, i) => (
          <circle
            key={i}
            cx={lm.x}
            cy={lm.y}
            r={i === 4 || i === 8 ? 0.018 : 0.012}
          />
        ))}
      </g>
    </svg>
  );
}
