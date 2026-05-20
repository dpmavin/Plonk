import { useEffect, useState } from 'react';
import './NowPlaying.css';

/**
 * NowPlaying — bottom-center pill showing active instrument while drawing.
 *
 * Props:
 *   color      — active color object { name, hex, instrument }
 *   active     — true while pinch is held (drawing)
 *   bumpKey    — incrementing number; triggers instrumentBounce on change
 */
export default function NowPlaying({ color, active, bumpKey }) {
  const [visible, setVisible] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  // Show while active, then linger 1.5s after release
  useEffect(() => {
    if (active) {
      setVisible(true);
      return undefined;
    }
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [active]);

  // Bounce label whenever bumpKey increments
  useEffect(() => {
    if (bumpKey == null) return;
    setBouncing(true);
    const t = setTimeout(() => setBouncing(false), 360);
    return () => clearTimeout(t);
  }, [bumpKey]);

  if (!visible) return null;

  return (
    <div className="now-playing" role="status">
      <span
        className="now-playing__dot"
        style={{ background: color.hex }}
        aria-hidden="true"
      />
      <span className={'now-playing__label' + (bouncing ? ' is-bouncing' : '')}>
        {color.instrument}
      </span>
    </div>
  );
}
