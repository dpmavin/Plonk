import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Canvas — two-layer drawing surface with regularized stroke rendering.
 *
 * Architecture:
 *   • committedRef — bottom canvas, holds finalized strokes
 *   • liveRef       — top canvas, holds the in-progress stroke only
 *
 * Each new buffered point clears the live canvas and redraws the whole
 * in-progress stroke through a Catmull-Rom→cubic-bezier path. When the
 * stroke ends we run a Chaikin pass over the buffered points and bake the
 * smoothed result onto the committed canvas. This regularizes hand-tracking
 * jitter and gives strokes a calm, intentional feel.
 *
 * Imperative handle:
 *   beginStroke({ x, y, color, size, tool })
 *   continueStroke({ x, y })   // 3px threshold inside
 *   endStroke()
 *   clear()
 *   exportPNG()
 */

const MIN_POINT_DISTANCE = 3; // px — kills micro-tremors

const Canvas = forwardRef(function Canvas({ width, height }, ref) {
  const committedRef = useRef(null);
  const liveRef = useRef(null);
  const strokeRef = useRef(null); // { points, color, size, tool }

  // Resize + DPR sync for both layers
  useEffect(() => {
    if (!width || !height) return;
    const dpr = window.devicePixelRatio || 1;
    for (const cv of [committedRef.current, liveRef.current]) {
      if (!cv) continue;
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, [width, height]);

  useImperativeHandle(ref, () => ({
    beginStroke({ x, y, color, size, tool }) {
      if (tool === 'eraser') {
        // Real-time eraser: write destination-out directly to the committed
        // canvas the moment the user starts. No buffer, no smoothing pass —
        // pixels disappear immediately under the cursor / pinch.
        eraseAt(committedRef.current, x, y, size);
        strokeRef.current = { tool: 'eraser', size, lastX: x, lastY: y };
        return;
      }
      strokeRef.current = {
        points: [{ x, y }],
        color,
        size,
        tool,
      };
      redrawLive();
    },

    continueStroke({ x, y }) {
      const s = strokeRef.current;
      if (!s) return;
      if (s.tool === 'eraser') {
        // Stroke a straight segment from the last erased point onto the
        // committed canvas. Drawn each frame, so erasing is real-time.
        eraseSegment(committedRef.current, s.lastX, s.lastY, x, y, s.size);
        s.lastX = x;
        s.lastY = y;
        return;
      }
      const last = s.points[s.points.length - 1];
      const dx = x - last.x;
      const dy = y - last.y;
      if (dx * dx + dy * dy < MIN_POINT_DISTANCE * MIN_POINT_DISTANCE) return;
      s.points.push({ x, y });
      redrawLive();
    },

    endStroke() {
      const s = strokeRef.current;
      if (!s) return;
      if (s.tool === 'eraser') {
        // Already committed in real time — nothing to flush.
        strokeRef.current = null;
        return;
      }
      // Final pass: Chaikin smoothing twice for soft corners, then commit.
      const smoothed = s.points.length >= 3 ? chaikin(s.points, 2) : s.points;
      const committedCtx = committedRef.current?.getContext('2d');
      if (committedCtx) {
        drawStroke(committedCtx, smoothed, s);
      }
      clearCanvas(liveRef.current);
      strokeRef.current = null;
    },

    clear() {
      clearCanvas(committedRef.current);
      clearCanvas(liveRef.current);
      strokeRef.current = null;
    },

    exportPNG() {
      const c = getCompositedCanvas();
      return c ? c.toDataURL('image/png') : null;
    },

    // Returns an offscreen canvas with both layers flattened, sized to the
    // bottom canvas's pixel dimensions. Callers (like the Save flow) can
    // drawImage() this onto a background + text bubble layer.
    getCompositedCanvas() {
      return getCompositedCanvas();
    },
  }), []);

  function getCompositedCanvas() {
    const c = committedRef.current;
    const l = liveRef.current;
    if (!c) return null;
    const out = document.createElement('canvas');
    out.width = c.width;
    out.height = c.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(c, 0, 0);
    if (l) ctx.drawImage(l, 0, 0);
    return out;
  }

  function redrawLive() {
    const s = strokeRef.current;
    const cv = liveRef.current;
    if (!s || !cv) return;
    clearCanvas(cv);
    const ctx = cv.getContext('2d');
    drawStroke(ctx, s.points, s, /* live = */ true);
  }

  return (
    <>
      <canvas
        ref={committedRef}
        className="plonk-canvas plonk-canvas--committed"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 'var(--z-canvas)',
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={liveRef}
        className="plonk-canvas plonk-canvas--live"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 'var(--z-canvas)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
});

// === Stroke renderer ===

function drawStroke(ctx, points, stroke, live = false) {
  if (!points || points.length === 0) return;
  const { color, size, tool } = stroke;

  const isMarker = tool === 'marker';
  const lineWidth = isMarker ? size * 1.8 : size;
  const alpha =
    tool === 'eraser' ? 1 :
    isMarker ? 0.75 :
    0.92;

  // Single point — draw a dot so taps register
  if (points.length === 1) {
    const p = points[0];
    ctx.save();
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Crayon: while drawing, show a smooth bezier preview (single layer). On
  // commit, render multi-layered wax texture for the final look.
  if (tool === 'crayon' && !live) {
    drawCrayon(ctx, points, color, size);
    return;
  }

  ctx.save();
  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = alpha;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  pathThroughPoints(ctx, points);
  ctx.stroke();
  ctx.restore();
}

// Catmull-Rom → cubic bezier path. Control points are 1/6 of the chord
// between the two neighbouring points (classic conversion). First/last
// segments mirror by duplicating endpoints.
function pathThroughPoints(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
    return;
  }
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

// Crayon: 6 jittered passes over the same bezier path
function drawCrayon(ctx, points, color, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.12 + Math.random() * 0.10;
    ctx.lineWidth = size * (0.7 + Math.random() * 0.6);
    const ox = (Math.random() - 0.5) * size * 0.5;
    const oy = (Math.random() - 0.5) * size * 0.5;
    ctx.save();
    ctx.translate(ox, oy);
    pathThroughPoints(ctx, points);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// Chaikin's corner-cutting: each pass replaces every segment AB with two
// new points (Q at 75/25, R at 25/75). Endpoints are preserved. Two passes
// looks like a deliberately drawn curve.
function chaikin(points, iterations = 1) {
  let pts = points;
  for (let iter = 0; iter < iterations; iter++) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      out.push({ x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y });
      out.push({ x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y });
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

// === Eraser helpers (direct destination-out on the committed canvas) ===

function eraseAt(cv, x, y, size) {
  if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function eraseSegment(cv, x0, y0, x1, y1, size) {
  if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = 1;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

function clearCanvas(cv) {
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.restore();
}

export default Canvas;
