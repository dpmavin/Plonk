import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useDraggable — pointer-driven dragging for fixed-positioned widgets.
 *
 * Returns:
 *   ref            — attach to the draggable container
 *   onPointerDown  — bind to elements that should initiate drag
 *   style          — { top, left } when dragged, else null (use CSS defaults)
 *   dragging       — boolean
 *
 * The hook constrains the widget inside the viewport (8px margin).
 */
export function useDraggable() {
  const ref = useRef(null);
  const [pos, setPos] = useState(null); // { top, left } | null = use CSS default
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(null);

  const handleMove = useCallback((e) => {
    if (!startRef.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const margin = 8;
    const maxLeft = window.innerWidth - rect.width - margin;
    const maxTop = window.innerHeight - rect.height - margin;
    const left = Math.min(maxLeft, Math.max(margin, e.clientX - startRef.current.offsetX));
    const top = Math.min(maxTop, Math.max(margin, e.clientY - startRef.current.offsetY));
    setPos({ left, top });
  }, []);

  const handleUp = useCallback(() => {
    startRef.current = null;
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!dragging) return undefined;
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp, { once: true });
    window.addEventListener('pointercancel', handleUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging, handleMove, handleUp]);

  const onPointerDown = useCallback((e) => {
    if (!ref.current) return;
    // Skip drag if the user clicked an interactive child (button, input, etc.)
    if (
      e.target.closest('button, input, textarea, select, [data-no-drag]')
    ) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    startRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    // Pin current rect to absolute coords so dragging starts from where it sits
    setPos({ left: rect.left, top: rect.top });
    setDragging(true);
    e.preventDefault();
  }, []);

  return {
    ref,
    onPointerDown,
    style: pos ? { left: pos.left, top: pos.top, right: 'auto', bottom: 'auto' } : null,
    dragging,
  };
}
