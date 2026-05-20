import { useCallback, useEffect, useRef, useState } from 'react';
import PlonkLogo from '../components/PlonkLogo';
import ToolPanel from '../components/ToolPanel';
import WebcamPiP from '../components/WebcamPiP';
import HandCursor from '../components/HandCursor';
import Canvas from '../components/Canvas';
import NowPlaying from '../components/NowPlaying';
import TextBubble from '../components/TextBubble';
import PromptCard from '../components/PromptCard';
import SaveDialog from '../components/SaveDialog';
import Toast from '../components/Toast';
import { randomPrompt } from '../constants/prompts';
import { useMemoryBook } from '../hooks/useMemoryBook';
import { exportArtworkPNG } from '../utils/canvasExport';
import { MemoryBookIcon, ClearIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { MVP_PALETTE } from '../constants/palette';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { usePinch } from '../hooks/usePinch';
import { useDrawing } from '../hooks/useDrawing';
import { useAudio } from '../hooks/useAudio';
import './CanvasView.css';

export default function CanvasView({ onOpenMemoryBook }) {
  const [activeColor, setActiveColor] = useState(MVP_PALETTE[0]);
  const [activeTool, setActiveTool] = useState('pen');
  const [strokeSize, setStrokeSize] = useState(8);
  const [sweeping, setSweeping] = useState(false);
  const [textBubbles, setTextBubbles] = useState([]); // {id, x, y, text, color, size}
  const [activeTextId, setActiveTextId] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(() => randomPrompt());
  const [showPrompt, setShowPrompt] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addArtwork } = useMemoryBook();

  const canvasAreaRef = useRef(null);
  const canvasRef = useRef(null);
  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });

  const { videoRef, landmarks, handVisible, cameraReady, error: cameraError } =
    useMediaPipe({ enabled: true });

  const audio = useAudio();

  // Unlock audio on first interaction anywhere in the canvas view
  useEffect(() => {
    if (audio.ready) return undefined;
    const handler = () => {
      audio.start();
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [audio]);

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

  // Throttle in-stroke notes so we don't fire every frame
  const lastNoteAtRef = useRef(0);
  const [noteBumpKey, setNoteBumpKey] = useState(0);
  const handleStrokeStart = useCallback(() => {
    audio.triggerCue('pinchStart');
    audio.triggerNote(activeColor.id);
    lastNoteAtRef.current = performance.now();
    setNoteBumpKey((k) => k + 1);
  }, [audio, activeColor.id]);
  const handleStrokeContinue = useCallback(() => {
    const now = performance.now();
    if (now - lastNoteAtRef.current > 280) {
      audio.triggerNote(activeColor.id);
      lastNoteAtRef.current = now;
      setNoteBumpKey((k) => k + 1);
    }
  }, [audio, activeColor.id]);
  const handleStrokeEnd = useCallback(() => {
    audio.triggerCue('pinchRelease');
  }, [audio]);

  useDrawing({
    canvasRef,
    isPinching,
    cursorX,
    cursorY,
    color: activeColor.hex,
    size: strokeSize,
    tool: activeTool,
    enabled: drawingEnabled,
    onStrokeStart: handleStrokeStart,
    onStrokeContinue: handleStrokeContinue,
    onStrokeEnd: handleStrokeEnd,
  });

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    audio.triggerCue('clear');
    setSweeping(true);
    setTimeout(() => setSweeping(false), 700);
  }, [audio]);

  const handleOpenMemoryBook = useCallback(() => {
    audio.triggerCue('memoryBookOpen');
    onOpenMemoryBook();
  }, [audio, onOpenMemoryBook]);

  const sizeLabelFromStroke = (n) =>
    n <= 10 ? 'S' : n <= 20 ? 'M' : 'L';

  const handleCanvasAreaClick = useCallback(
    (e) => {
      if (activeTool !== 'text') return;
      // Don't place when clicking an existing bubble (TextBubble stops propagation)
      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setTextBubbles((bs) => [
        ...bs,
        {
          id,
          x,
          y,
          text: '',
          color: activeColor.hex,
          size: sizeLabelFromStroke(strokeSize),
        },
      ]);
      setActiveTextId(id);
    },
    [activeTool, activeColor.hex, strokeSize]
  );

  const handleTextChange = useCallback((id, text) => {
    setTextBubbles((bs) => bs.map((b) => (b.id === id ? { ...b, text } : b)));
  }, []);

  const handleTextCommit = useCallback((id) => {
    setActiveTextId((curr) => (curr === id ? null : curr));
    // Remove empty bubbles on commit
    setTextBubbles((bs) =>
      bs.filter((b) => b.id !== id || (b.text && b.text.trim() !== ''))
    );
  }, []);

  const handleTextDelete = useCallback((id) => {
    setTextBubbles((bs) => bs.filter((b) => b.id !== id));
    setActiveTextId((curr) => (curr === id ? null : curr));
  }, []);

  const handleKeyAudio = useCallback(
    (cueName) => {
      audio.triggerCue(cueName);
    },
    [audio]
  );

  const handleOpenSave = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleSave = useCallback(
    async ({ title, mood, pinned }) => {
      // Need the underlying canvas element for compositing
      const canvasEl =
        canvasAreaRef.current?.querySelector('canvas.plonk-canvas');
      const imageDataURL = exportArtworkPNG({
        canvasEl,
        bubbles: textBubbles,
        bgColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-canvas-bg')
          .trim() || '#FAFAF7',
        areaWidth: areaSize.w,
        areaHeight: areaSize.h,
      });
      addArtwork({
        title,
        mood,
        pinned,
        prompt: showPrompt ? currentPrompt : '',
        imageDataURL,
      });
      audio.triggerCue('save');
      setShowSaveDialog(false);
      setShowToast(true);
    },
    [textBubbles, areaSize.w, areaSize.h, addArtwork, audio, showPrompt, currentPrompt]
  );

  return (
    <div className="canvas-view">
      <header className="canvas-view__header">
        <PlonkLogo variant="default" />
        <button
          type="button"
          className="canvas-view__header-btn"
          aria-label={COPY.headerMemoryBookAria}
          onClick={handleOpenMemoryBook}
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
          audio={audio}
        />

        <main
          ref={canvasAreaRef}
          className={
            'canvas-view__canvas-area linen-canvas' +
            (activeTool === 'text' ? ' is-text-mode' : '')
          }
          onClick={handleCanvasAreaClick}
        >
          {!cameraReady && !cameraError && (
            <div className="canvas-view__loading">Waking up the camera…</div>
          )}
          <Canvas ref={canvasRef} width={areaSize.w} height={areaSize.h} />

          {showPrompt && (
            <PromptCard
              text={currentPrompt}
              onSkip={() => setCurrentPrompt((p) => randomPrompt(p))}
              onDismiss={() => setShowPrompt(false)}
              audio={audio}
            />
          )}
          {sweeping && <div className="canvas-view__sweep" aria-hidden="true" />}

          {textBubbles.map((b) => (
            <TextBubble
              key={b.id}
              x={b.x}
              y={b.y}
              color={b.color}
              size={b.size}
              text={b.text}
              active={activeTextId === b.id}
              onActivate={() => setActiveTextId(b.id)}
              onChange={(t) => handleTextChange(b.id, t)}
              onCommit={() => handleTextCommit(b.id)}
              onDelete={() => handleTextDelete(b.id)}
              onKeyAudio={handleKeyAudio}
            />
          ))}

          <HandCursor
            x={cursorX}
            y={cursorY}
            visible={handVisible}
            pinching={isPinching}
            color={activeColor.hex}
            rippleKey={rippleKey}
          />
          <NowPlaying
            color={activeColor}
            active={isPinching && drawingEnabled}
            bumpKey={noteBumpKey}
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
        <button type="button" className="btn btn--primary" onClick={handleOpenSave}>
          <span>{COPY.footer.save}</span>
        </button>
      </footer>

      <WebcamPiP videoRef={videoRef} error={cameraError} />

      {showSaveDialog && (
        <SaveDialog
          onCancel={() => setShowSaveDialog(false)}
          onSave={handleSave}
        />
      )}

      {showToast && (
        <Toast message={COPY.toast.saved} onDone={() => setShowToast(false)} />
      )}
    </div>
  );
}
