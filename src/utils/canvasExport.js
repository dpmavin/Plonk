/**
 * Composite the canvas + text bubbles + linen background into a single PNG.
 *
 * canvasEl    — the HTMLCanvasElement with strokes
 * bubbles     — array of { x, y, text, color, size, width? }
 * bgColor     — hex string for the background
 * areaWidth   — render width in px
 * areaHeight  — render height in px
 *
 * Returns: dataURL string.
 */
export function exportArtworkPNG({
  canvasEl,
  bubbles,
  bgColor = '#FAFAF7',
  areaWidth,
  areaHeight,
}) {
  if (!canvasEl) return null;
  const dpr = window.devicePixelRatio || 1;
  const out = document.createElement('canvas');
  out.width = Math.round(areaWidth * dpr);
  out.height = Math.round(areaHeight * dpr);
  const ctx = out.getContext('2d');
  ctx.scale(dpr, dpr);

  // 1. background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, areaWidth, areaHeight);

  // 2. strokes — drawImage scales the high-DPR source canvas to display px
  ctx.drawImage(canvasEl, 0, 0, areaWidth, areaHeight);

  // 3. text bubbles
  for (const b of bubbles) {
    const sizePx = b.size === 'S' ? 14 : b.size === 'L' ? 28 : 20;
    ctx.fillStyle = b.color;
    ctx.font = `600 ${sizePx}px Nunito, sans-serif`;
    ctx.textBaseline = 'top';
    // approximate left/top placement (matches text-bubble CSS padding 8/12)
    wrapText(ctx, b.text || '', b.x + 12, b.y + 8, 296, sizePx * 1.4);
  }

  return out.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const w = ctx.measureText(testLine).width;
    if (w > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, yy);
}
