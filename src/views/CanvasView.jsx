import { useCallback, useEffect, useRef, useState } from 'react';
import PlonkLogo from '../components/PlonkLogo';
import ToolPanel from '../components/ToolPanel';
import WebcamPiP from '../components/WebcamPiP';
import HandCursor from '../components/HandCursor';
import Canvas from '../components/Canvas';
import { MemoryBookIcon, ClearIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { MVP_PALETTE } from '../constants/palette';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { usePinch } from '../hooks/usePinch';
import { useDrawing } from '../hooks/useDrawing';
import './CanvasView.css';

export default function CanvasView({ onOpenMemoryBook }) {
  const [activeColor, setActiveColor] = useState(MVP_PALETTE[0]);
  const [activeTool, setActiveTool] = useState('pen');
  const [strokeSize, setStrokeSize] = useState(8);
  const [sweeping, setSweeping] = useState(false);

  const canvasAreaRef = useRef(null);
  const canvasRef = useRef(null);
  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });

  const { videoRef, landmarks, handVisible, cameraReady, error: cameraError } =
    useMediaPipe({ enabled: true });

  useEffect(() => {
    if (!canvasAreaRef.current) return undefined;
    const el = canvasAreaRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setAreaSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setAreaSize({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, []);

  const indexTip = landmarks[8];
  const cursorX = indexTip ? indexTip.x * areaSize.w : 0;
  const cursorY = indexTip ? indexTip.y * areaSize.h : 0;

  const { isPinching, rippleKey } = usePinch({
    landmarks,
    areaWidth: areaSize.w,
    areaHeight: areaSize.h,
    thresholdPx: 40,
  });

  // Drawing is only active in pen/crayon modes (text tool placed via mouse)
  const drawingEnabled =
    handVisible && (activeTool === 'pen' || activeTool === 'crayon');

  useDrawing({
    canvasRef,
    isPinching,
    cursorX,
    cursorY,
    color: activeColor.hex,
    size: strokeSize,
    tool: activeTool,
    enabled: drawingEnabled,
  });

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setSweeping(true);
    setTimeout(() => setSweeping(false), 700);
  }, []);

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

        <main ref={canvasAreaRef} className="canvas-view__canvas-area linen-canvas">
          {!cameraReady && !cameraError && (
            <div className="canvas-view__loading">Waking up the camera…</div>
          )}
          <Canvas ref={canvasRef} width={areaSize.w} height={areaSize.h} />
          {sweeping && <div className="canvas-view__sweep" aria-hidden="true" />}
          <HandCursor
            x={cursorX}
            y={cursorY}
            visible={handVisible}
            pinching={isPinching}
            color={activeColor.hex}
            rippleKey={rippleKey}
          />
        </main>
      </div>

      <footer className="canvas-view__footer">
        <button
          type="button"
          className="btn btn--ghost btn--ghost-danger"
          onClick={handleClear}
        >
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
