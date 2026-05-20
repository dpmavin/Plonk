import { useEffect, useRef, useState } from 'react';

/**
 * usePinch — derives pinch state from MediaPipe landmarks.
 *
 * Pinch = thumb tip (landmark 4) within threshold of index tip (landmark 8),
 * measured in 2D normalized space scaled to the viewport's smaller dimension.
 *
 * Props:
 *   landmarks    — array of 21 {x, y, z} normalized; empty when no hand
 *   areaWidth    — pixel width of the drawing surface (for px threshold)
 *   areaHeight   — pixel height of the drawing surface
 *   thresholdPx  — pinch distance in px (default 40)
 *
 * Returns:
 *   isPinching   — boolean
 *   pinchX       — normalized x [0..1] (midpoint of thumb/index)
 *   pinchY       — normalized y [0..1]
 *   rippleKey    — increments at the start of each new pinch
 */
export function usePinch({
  landmarks,
  areaWidth,
  areaHeight,
  thresholdPx = 40,
}) {
  const [state, setState] = useState({ isPinching: false, x: 0, y: 0 });
  const [rippleKey, setRippleKey] = useState(0);
  const wasPinching = useRef(false);

  useEffect(() => {
    const thumb = landmarks[4];
    const index = landmarks[8];

    if (!thumb || !index || !areaWidth || !areaHeight) {
      if (wasPinching.current) {
        wasPinching.current = false;
        setState((s) => ({ ...s, isPinching: false }));
      }
      return;
    }

    // Scale to px in the smaller dimension for a stable threshold across aspect ratios
    const scale = Math.min(areaWidth, areaHeight);
    const dx = (thumb.x - index.x) * scale;
    const dy = (thumb.y - index.y) * scale;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Hysteresis: enter at threshold, leave at threshold * 1.4 — avoids flicker
    const enterTh = thresholdPx;
    const leaveTh = thresholdPx * 1.4;
    const nextIsPinching = wasPinching.current
      ? dist < leaveTh
      : dist < enterTh;

    const midX = (thumb.x + index.x) / 2;
    const midY = (thumb.y + index.y) / 2;

    if (nextIsPinching && !wasPinching.current) {
      setRippleKey((k) => k + 1);
    }

    wasPinching.current = nextIsPinching;
    setState({ isPinching: nextIsPinching, x: midX, y: midY });
  }, [landmarks, areaWidth, areaHeight, thresholdPx]);

  return {
    isPinching: state.isPinching,
    pinchX: state.x,
    pinchY: state.y,
    rippleKey,
  };
}
