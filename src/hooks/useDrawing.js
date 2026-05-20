import { useEffect, useRef } from 'react';

/**
 * useDrawing — drives an imperative Canvas ref from pinch state + cursor pos.
 *
 * Fires onStrokeStart() the first frame pinch becomes true, and onStrokeEnd()
 * the first frame it becomes false, so callers can layer audio / NowPlaying.
 *
 * The cursor MUST already be mapped to canvas-area px coordinates.
 */
export function useDrawing({
  canvasRef,
  isPinching,
  cursorX,
  cursorY,
  color,
  size,
  tool,
  enabled = true,
  onStrokeStart,
  onStrokeContinue,
  onStrokeEnd,
}) {
  const wasPinchingRef = useRef(false);
  const lastPosRef = useRef(null);

  // Use refs so handlers see latest values without re-binding effects per frame
  const colorRef = useRef(color);
  const sizeRef = useRef(size);
  const toolRef = useRef(tool);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = size; }, [size]);
  useEffect(() => { toolRef.current = tool; }, [tool]);

  useEffect(() => {
    if (!enabled) {
      // If disabled mid-stroke, close it cleanly
      if (wasPinchingRef.current) {
        canvasRef.current?.endStroke();
        onStrokeEnd?.();
        wasPinchingRef.current = false;
        lastPosRef.current = null;
      }
      return;
    }
    const cv = canvasRef.current;
    if (!cv) return;

    if (isPinching && !wasPinchingRef.current) {
      // pinch start
      wasPinchingRef.current = true;
      lastPosRef.current = { x: cursorX, y: cursorY };
      cv.beginStroke({
        x: cursorX,
        y: cursorY,
        color: colorRef.current,
        size: sizeRef.current,
        tool: toolRef.current,
      });
      onStrokeStart?.({ x: cursorX, y: cursorY });
    } else if (isPinching && wasPinchingRef.current) {
      // pinch continue — only segment when finger has moved enough
      const last = lastPosRef.current;
      const dx = cursorX - (last?.x ?? cursorX);
      const dy = cursorY - (last?.y ?? cursorY);
      const dist2 = dx * dx + dy * dy;
      if (dist2 > 1) {
        cv.continueStroke({ x: cursorX, y: cursorY });
        lastPosRef.current = { x: cursorX, y: cursorY };
        onStrokeContinue?.({ x: cursorX, y: cursorY });
      }
    } else if (!isPinching && wasPinchingRef.current) {
      // pinch release
      wasPinchingRef.current = false;
      lastPosRef.current = null;
      cv.endStroke();
      onStrokeEnd?.();
    }
  }, [isPinching, cursorX, cursorY, enabled, canvasRef, onStrokeStart, onStrokeContinue, onStrokeEnd]);
}
