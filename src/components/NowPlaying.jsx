import { useEffect, useState } from 'react';
import './NowPlaying.css';

/**
 * NowPlaying — bottom-center pill showing active instrument while drawing.
 *
 * Props:
 *   color      — active color object { name, hex, instrument }
 *   active     — true while pinch is held (drawing)
 *   bumpKey    — incrementing number; remounts the label span to restart bounce
 */
export default function NowPlaying({ color, active, bumpKey }) {
  // Linger 1.5s after release before hiding
  const [showAfterRelease, setShowAfterRelease] = useState(false);

  useEffect(() => {
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowAfterRelease(true);
      return undefined;
    }
    const t = setTimeout(() => setShowAfterRelease(false), 1500);
    return () => clearTimeout(t);
  }, [active]);

  if (!active && !showAfterRelease) return null;

  return (
    <div className="now-playing" role="status">
      <span
        className="now-playing__dot"
        style={{ background: color.hex }}
        aria-hidden="true"
      />
      {/* key=bumpKey remounts the label, restarting the bounce animation */}
      <span key={bumpKey} className="now-playing__label is-bouncing">
        {color.instrument}
      </span>
    </div>
  );
}
