import { useEffect, useRef, useState } from 'react';

/**
 * usePinch — pinch state with start-hold and instant release.
 *
 * Detection is rotation-, scale-, and chirality-invariant: we compute the
 * 3D distance between thumb tip (4) and index tip (8) and divide by the
 * hand's palm size (wrist → middle-finger MCP). The resulting ratio is the
 * same whether the palm faces the camera, faces sideways, the hand is left
 * or right, big or small, near or far.
 *
 * Rule:
 *   Pinch detected → wait `engageHoldMs` → start drawing
 *   Pinch released → stop drawing instantly (no debounce, no carry-over)
 *
 * Returns:
 *   isPinching     — boolean, true only after the hold has elapsed
 *   isHolding      — boolean, true during the engage window
 *   pinchX/pinchY  — normalized midpoint of thumb/index (2D for cursor)
 *   rippleKey      — increments at engagement
 */
export function usePinch({
  landmarks,
  threshold = 0.35,        // ratio of thumb-index distance to palm size
  engageHoldMs = 2000,
}) {
  const [state, setState] = useState({
    isPinching: false,
    isHolding: false,
    x: 0,
    y: 0,
  });
  const [rippleKey, setRippleKey] = useState(0);

  const engagedRef = useRef(false);
  const engageStartRef = useRef(null);

  useEffect(() => {
    // Legitimate sync-from-external-input: this hook mirrors the MediaPipe
    // landmark stream into derived pinch state.
    /* eslint-disable react-hooks/set-state-in-effect */
    const thumb = landmarks[4];
    const wrist = landmarks[0];
    const middleMCP = landmarks[9];

    // Hand lost or partially detected: release instantly + clear timers
    if (!thumb || !wrist || !middleMCP) {
      if (engagedRef.current) {
        engagedRef.current = false;
      }
      engageStartRef.current = null;
      setState({ isPinching: false, isHolding: false, x: 0, y: 0 });
      return;
    }

    // Find the closest point on the index finger (MCP→PIP→DIP→tip) to the
    // thumb tip. This way "claw" / curled-thumb gestures register as a pinch
    // even when the thumb meets the side of the index, not its tip.
    let minDist = Infinity;
    let closestLm = null;
    for (const i of [5, 6, 7, 8]) {
      const lm = landmarks[i];
      if (!lm) continue;
      const dx = thumb.x - lm.x;
      const dy = thumb.y - lm.y;
      const dz = (thumb.z || 0) - (lm.z || 0);
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < minDist) {
        minDist = d;
        closestLm = lm;
      }
    }

    if (!closestLm) {
      if (engagedRef.current) {
        engagedRef.current = false;
      }
      engageStartRef.current = null;
      setState({ isPinching: false, isHolding: false, x: 0, y: 0 });
      return;
    }

    // Palm size reference (wrist → middle finger MCP), also 3D
    const pdx = wrist.x - middleMCP.x;
    const pdy = wrist.y - middleMCP.y;
    const pdz = (wrist.z || 0) - (middleMCP.z || 0);
    const palmSize = Math.sqrt(pdx * pdx + pdy * pdy + pdz * pdz);

    // Ratio = thumb-to-closest-index-point / palm size. Pose & scale free.
    const ratio = palmSize > 1e-6 ? minDist / palmSize : 1;

    const now = performance.now();
    const leaveTh = threshold * 1.4;
    const rawPinching = engagedRef.current ? ratio < leaveTh : ratio < threshold;

    let nextEngaged = engagedRef.current;
    let holding = false;

    if (rawPinching) {
      if (!engagedRef.current) {
        // Begin or continue the engage timer
        if (engageStartRef.current == null) {
          engageStartRef.current = now;
        }
        if (now - engageStartRef.current >= engageHoldMs) {
          nextEngaged = true;
          engageStartRef.current = null;
        } else {
          holding = true;
        }
      }
    } else {
      // INSTANT release — never debounced, regardless of engageStart state
      engageStartRef.current = null;
      if (engagedRef.current) {
        nextEngaged = false;
      }
    }

    // Cursor sits at the midpoint of the actual pinch contact, not always
    // the tip — feels right for thumb-to-PIP curls as well as tip-to-tip.
    const midX = (thumb.x + closestLm.x) / 2;
    const midY = (thumb.y + closestLm.y) / 2;

    if (nextEngaged && !engagedRef.current) {
      setRippleKey((k) => k + 1);
    }

    engagedRef.current = nextEngaged;
    setState({
      isPinching: nextEngaged,
      isHolding: holding,
      x: midX,
      y: midY,
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [landmarks, threshold, engageHoldMs]);

  return {
    isPinching: state.isPinching,
    isHolding: state.isHolding,
    pinchX: state.x,
    pinchY: state.y,
    rippleKey,
  };
}
