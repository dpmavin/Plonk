import { useEffect, useState } from 'react';
import PlonkLogo from '../components/PlonkLogo';
import ToolPanel from '../components/ToolPanel';
import WebcamPiP from '../components/WebcamPiP';
import { MemoryBookIcon, ClearIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { MVP_PALETTE } from '../constants/palette';
import { useMediaPipe } from '../hooks/useMediaPipe';
import './CanvasView.css';

export default function CanvasView({ onOpenMemoryBook }) {
  const [activeColor, setActiveColor] = useState(MVP_PALETTE[0]);
  const [activeTool, setActiveTool] = useState('pen');
  const [strokeSize, setStrokeSize] = useState(8);

  const { videoRef, landmarks, handVisible, cameraReady, error: cameraError } =
    useMediaPipe({ enabled: true });

  // Dev: log landmark stream once when first detected
  useEffect(() => {
    if (handVisible && landmarks.length === 21 && import.meta.env.DEV) {
      // throttle log: only log every ~30 frames
      const w = window;
      w.__plonkFrame = (w.__plonkFrame || 0) + 1;
      if (w.__plonkFrame % 30 === 0) {
        // eslint-disable-next-line no-console
        console.log('[plonk] landmarks index tip:', landmarks[8]);
      }
    }
  }, [handVisible, landmarks]);

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
        <ToolPanel
          activeColor={activeColor}
          onSelectColor={setActiveColor}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          strokeSize={strokeSize}
          onChangeSize={setStrokeSize}
        />

        <main className="canvas-view__canvas-area linen-canvas">
          {/* Canvas, HandCursor, NowPlaying, TextBubbles go here in later steps */}
          {!cameraReady && !cameraError && (
            <div className="canvas-view__loading">Waking up the camera…</div>
          )}
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

      <WebcamPiP videoRef={videoRef} error={cameraError} />
    </div>
  );
}
