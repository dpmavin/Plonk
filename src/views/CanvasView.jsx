import { useState } from 'react';
import PlonkLogo from '../components/PlonkLogo';
import { MemoryBookIcon, ClearIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { MVP_PALETTE } from '../constants/palette';
import './CanvasView.css';

export default function CanvasView({ onOpenMemoryBook }) {
  const [activeColor, setActiveColor] = useState(MVP_PALETTE[0]);
  const [activeTool, setActiveTool] = useState('pen'); // 'pen' | 'crayon' | 'text'
  const [strokeSize, setStrokeSize] = useState(8);

  return (
    <div className="canvas-view">
      <header className="canvas-view__header">
        <PlonkLogo variant="default" />
        <button
          type="button"
          className="canvas-view__header-btn"
          aria-label={COPY.headerMemoryBookAria}
          onClick={onOpenMemoryBook}
        >
          <MemoryBookIcon />
        </button>
      </header>

      <div className="canvas-view__body">
        {/* ToolPanel placeholder — Step 5 */}
        <aside className="canvas-view__panel-placeholder" aria-label="Tools">
          <div style={{ padding: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
            Tools
          </div>
        </aside>

        {/* Canvas area placeholder — Step 4 */}
        <main className="canvas-view__canvas-area linen-canvas">
          {/* Canvas, HandCursor, NowPlaying, WebcamPiP, TextBubbles go here */}
        </main>
      </div>

      <footer className="canvas-view__footer">
        <button type="button" className="btn btn--ghost btn--ghost-danger">
          <ClearIcon />
          <span>{COPY.footer.clear}</span>
        </button>
        <button type="button" className="btn btn--primary">
          <span>{COPY.footer.save}</span>
        </button>
      </footer>
    </div>
  );
}
