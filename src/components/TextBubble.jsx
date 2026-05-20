import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons';
import './TextBubble.css';

const SIZE_TO_PX = { S: 14, M: 20, L: 28 };

/**
 * TextBubble — placed text annotation on the canvas.
 *
 * Props:
 *   x, y          — canvas coordinates (px)
 *   color         — hex string
 *   size          — 'S' | 'M' | 'L'
 *   text          — initial text
 *   active        — true if currently being edited (dashed border)
 *   onChange      — (text) => void  (called on each keystroke for committed text)
 *   onCommit      — () => void      (called on click-away/blur)
 *   onDelete      — () => void
 *   onActivate    — () => void      (call when user clicks the bubble)
 *   onKeyAudio    — (cueName) => void
 */
export default function TextBubble({
  x,
  y,
  color,
  size = 'M',
  text,
  active,
  onChange,
  onCommit,
  onDelete,
  onActivate,
  onKeyAudio,
}) {
  const ref = useRef(null);
  const initializedRef = useRef(false);
  const [hovering, setHovering] = useState(false);

  // Initialize the editor's text content ONCE via the DOM ref.
  // We never re-render `text` as a React child — that would replace the text
  // node on every keystroke, snapping the caret to position 0 (which makes
  // typing appear right-to-left).
  useEffect(() => {
    if (ref.current && !initializedRef.current) {
      ref.current.textContent = text || '';
      initializedRef.current = true;
    }
  }, [text]);

  // Focus + place caret at end when activated
  useEffect(() => {
    if (active && ref.current) {
      ref.current.focus();
      placeCaretAtEnd(ref.current);
    }
  }, [active]);

  // Click-away to commit
  useEffect(() => {
    if (!active) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onCommit?.();
      }
    };
    window.addEventListener('pointerdown', handler, true);
    return () => window.removeEventListener('pointerdown', handler, true);
  }, [active, onCommit]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onKeyAudio?.('enterKey');
      onCommit?.();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCommit?.();
      return;
    }
    if (e.key === 'Backspace') {
      onKeyAudio?.('backspace');
      return;
    }
    if (e.key === ' ') {
      onKeyAudio?.('spaceBar');
      return;
    }
    if (e.key.length === 1) {
      onKeyAudio?.('keyPress');
    }
  };

  return (
    <div
      className={
        'text-bubble' +
        (active ? ' is-active' : '') +
        (hovering ? ' is-hovering' : '')
      }
      style={{
        transform: `translate(${x}px, ${y}px)`,
        color,
        '--bubble-color': color,
        fontSize: `${SIZE_TO_PX[size]}px`,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) onActivate?.();
      }}
    >
      <div
        ref={ref}
        className="text-bubble__editor"
        dir="ltr"
        contentEditable={active}
        suppressContentEditableWarning
        onInput={(e) => onChange?.(e.currentTarget.textContent)}
        onKeyDown={handleKeyDown}
      />

      {!active && hovering && (
        <button
          type="button"
          className="text-bubble__delete"
          aria-label="Delete text"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

function placeCaretAtEnd(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
