import { useEffect, useState } from 'react';
import { CheckIcon } from './icons';
import './Toast.css';

/**
 * Toast — fires once on mount, auto-dismisses after 2.5s.
 *
 * Props:
 *   message  — string
 *   onDone   — called after the slide-out completes
 */
export default function Toast({ message, onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const showT = setTimeout(() => setLeaving(true), 2500);
    const doneT = setTimeout(() => onDone?.(), 2500 + 300);
    return () => {
      clearTimeout(showT);
      clearTimeout(doneT);
    };
  }, [onDone]);

  return (
    <div
      className={'toast' + (leaving ? ' is-leaving' : '')}
      role="status"
      aria-live="polite"
    >
      <span className="toast__check">
        <CheckIcon />
      </span>
      <span className="toast__msg">{message}</span>
    </div>
  );
}
