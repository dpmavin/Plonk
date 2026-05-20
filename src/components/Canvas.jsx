import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Canvas — HTML5 drawing surface. Provides imperative handle for stroke ops.
 *
 * Props:
 *   width, height       — pixel size (kept in sync by parent via resize observer)
 *
 * Imperative handle:
 *   beginStroke({ x, y, color, size, tool })
 *   continueStroke({ x, y })
 *   endStroke()
 *   clear()
 *   exportPNG()         — returns a dataURL string
 */
const Canvas = forwardRef(function Canvas({ width, height }, ref) {
  const canvasRef = useRef(null);
  const strokeRef = useRef(null);

  // Resize canvas with devicePixelRatio for crisp lines
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !width || !height) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(width * dpr);
    cv.height = Math.round(height * dpr);
    cv.style.width = `${width}px`;
    cv.style.height = `${height}px`;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [width, height]);

  useImperativeHandle(ref, () => ({
    beginStroke({ x, y, color, size, tool }) {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      strokeRef.current = { x, y, color, size, tool, points: [{ x, y }] };
      // For pen, draw an immediate small dot so taps register
      if (tool === 'pen') {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },

    continueStroke({ x, y }) {
      const cv = canvasRef.current;
      const s = strokeRef.current;
      if (!cv || !s) return;
      const ctx = cv.getContext('2d');
      const prev = s.points[s.points.length - 1];
      s.points.push({ x, y });

      if (s.tool === 'pen') {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.92;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = s.color;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      } else if (s.tool === 'crayon') {
        drawCrayonSegment(ctx, prev, { x, y }, s.color, s.size);
      }
    },

    endStroke() {
      strokeRef.current = null;
    },

    clear() {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.restore();
    },

    exportPNG() {
      const cv = canvasRef.current;
      if (!cv) return null;
      return cv.toDataURL('image/png');
    },
  }), []);

  return (
    <canvas
      ref={canvasRef}
      className="plonk-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 'var(--z-canvas)',
        pointerEvents: 'none',
      }}
    />
  );
});

function drawCrayonSegment(ctx, a, b, color, size) {
  // Multi-pass low-alpha strokes with offset and width jitter — wax texture
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
    ctx.beginPath();
    ctx.moveTo(a.x + ox, a.y + oy);
    ctx.lineTo(b.x + ox, b.y + oy);
    ctx.stroke();
  }
  ctx.restore();
}

export default Canvas;
