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
import { CheckIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { MVP_PALETTE } from '../constants/palette';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { usePinch } from '../hooks/usePinch';
import { useDrawing } from '../hooks/useDrawing';
import { useAudio } from '../hooks/useAudio';
import './CanvasView.css';

export default function CanvasView() {
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
  const [cameraOn, setCameraOn] = useState(true);

  const { addArtwork } = useMemoryBook();

  const canvasAreaRef = useRef(null);
  const canvasRef = useRef(null);
  const [areaSize, setAreaSize] = useState({ w: 0, h: 0 });

  const { videoRef, landmarks, handVisible, cameraReady, error: cameraError } =
    useMediaPipe({ enabled: cameraOn });

  const audio = useAudio();

  const handleToggleCamera = useCallback(() => {
    setCameraOn((prev) => {
      const next = !prev;
      // Soft chime when the user turns the camera back on; muted exhale when off
      if (next) audio.triggerCue('memoryBookOpen');
      else audio.triggerCue('pinchRelease');
      return next;
    });
  }, [audio]);

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

  const { isPinching, isHolding, pinchX, pinchY, rippleKey } = usePinch({
    landmarks,
    // Eraser is real-time: skip the engage hold entirely so erasing happens
    // the moment you pinch. Pen/crayon still get the 1s hold to prevent
    // accidental stroke starts.
    engageHoldMs: activeTool === 'eraser' ? 0 : 1000,
  });

  // Drawing target = pinch midpoint when pinching (matches what the user
  // actually feels), otherwise the index fingertip (for hover cursor).
  const indexTip = landmarks[8];
  const rawX = isPinching && pinchX
    ? pinchX * areaSize.w
    : (indexTip ? indexTip.x * areaSize.w : 0);
  const rawY = isPinching && pinchY
    ? pinchY * areaSize.h
    : (indexTip ? indexTip.y * areaSize.h : 0);

  // Exponential moving average — softens MediaPipe's per-frame jitter while
  // keeping stroke onset responsive. We snap to raw on pinch start so the
  // first drawn point matches the cursor exactly.
  const [smoothed, setSmoothed] = useState({ x: 0, y: 0, ready: false, wasPinching: false });
  useEffect(() => {
    // Legitimate sync-from-external-input: MediaPipe's landmark stream is the
    // external source; we mirror it through a low-pass filter into state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSmoothed((prev) => {
      if (!prev.ready) {
        return { x: rawX, y: rawY, ready: handVisible, wasPinching: isPinching };
      }
      if (isPinching && !prev.wasPinching) {
        // Snap on pinch onset — no lag at stroke start
        return { x: rawX, y: rawY, ready: true, wasPinching: true };
      }
      // Heavy smoothing — kills micro-tremors while still following intent.
      // Hover is slightly looser so the visible cursor stays responsive.
      const a = isPinching ? 0.18 : 0.4;
      return {
        x: prev.x + a * (rawX - prev.x),
        y: prev.y + a * (rawY - prev.y),
        ready: true,
        wasPinching: isPinching,
      };
    });
  }, [rawX, rawY, isPinching, handVisible]);
  const cursorX = smoothed.x;
  const cursorY = smoothed.y;

  // Drawing is active in pen/crayon/eraser modes (text tool placed via mouse)
  const drawingEnabled =
    handVisible &&
    (activeTool === 'pen' || activeTool === 'marker' || activeTool === 'crayon' || activeTool === 'eraser');

  // Throttle in-stroke notes so we don't fire every frame
  const lastNoteAtRef = useRef(0);
  const [noteBumpKey, setNoteBumpKey] = useState(0);

  // Capture the moment of the first stroke and the set of colors actually used,
  // so saves can record duration_seconds + colors_used for the Memory Book.
  const drawStartedAtRef = useRef(null);
  const colorsUsedRef = useRef(new Set());

  const handleStrokeStart = useCallback(() => {
    audio.triggerCue('pinchStart');
    if (drawStartedAtRef.current == null) {
      drawStartedAtRef.current = Date.now();
    }
    if (activeTool !== 'eraser') {
      colorsUsedRef.current.add(activeColor.hex);
      audio.triggerNote(activeColor.id);
      setNoteBumpKey((k) => k + 1);
    }
    lastNoteAtRef.current = performance.now();
  }, [audio, activeColor.id, activeColor.hex, activeTool]);
  const handleStrokeContinue = useCallback(() => {
    if (activeTool === 'eraser') return;
    const now = performance.now();
    if (now - lastNoteAtRef.current > 280) {
      audio.triggerNote(activeColor.id);
      lastNoteAtRef.current = now;
      setNoteBumpKey((k) => k + 1);
    }
  }, [audio, activeColor.id, activeTool]);
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
    drawStartedAtRef.current = null;
    colorsUsedRef.current = new Set();
    setTextBubbles([]);
    setActiveTextId(null);
    setTimeout(() => setSweeping(false), 700);
  }, [audio]);

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

  // === Mouse drawing — pointerdown/move/up for pen/crayon/eraser tools ===
  const handleAreaPointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return; // only primary button
      if (
        activeTool !== 'pen' &&
        activeTool !== 'marker' &&
        activeTool !== 'crayon' &&
        activeTool !== 'eraser'
      ) return;
      // Don't draw when interacting with overlay UI inside the canvas-area
      if (e.target.closest('.text-bubble, .prompt-card, .webcam-pip')) return;

      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x0 = e.clientX - rect.left;
      const y0 = e.clientY - rect.top;

      canvasRef.current?.beginStroke({
        x: x0,
        y: y0,
        color: activeColor.hex,
        size: strokeSize,
        tool: activeTool,
      });
      handleStrokeStart();

      const onMove = (ev) => {
        const r = canvasAreaRef.current?.getBoundingClientRect();
        if (!r) return;
        const x = ev.clientX - r.left;
        const y = ev.clientY - r.top;
        canvasRef.current?.continueStroke({ x, y });
        handleStrokeContinue();
      };
      const onUp = () => {
        canvasRef.current?.endStroke();
        handleStrokeEnd();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
      window.addEventListener('pointercancel', onUp, { once: true });
      e.preventDefault();
    },
    [
      activeTool,
      activeColor.hex,
      strokeSize,
      handleStrokeStart,
      handleStrokeContinue,
      handleStrokeEnd,
    ]
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
      // Composites both layers (committed + live) into a single canvas
      const strokesCanvas = canvasRef.current?.getCompositedCanvas() || null;
      const imageDataURL = exportArtworkPNG({
        canvasEl: strokesCanvas,
        bubbles: textBubbles,
        bgColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-canvas-bg')
          .trim() || '#FAFAF7',
        areaWidth: areaSize.w,
        areaHeight: areaSize.h,
      });

      // Compute duration from first stroke (or instant save if user pressed
      // Save before drawing anything).
      const startedAt = drawStartedAtRef.current ?? Date.now();
      const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

      addArtwork({
        title,
        mood,
        pinned,
        prompt: showPrompt ? currentPrompt : '',
        imageDataURL,
        colors_used: Array.from(colorsUsedRef.current),
        duration_seconds: durationSeconds,
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

        <div className="canvas-view__canvas-column">
          {showPrompt && (
            <PromptCard
              text={currentPrompt}
              onSkip={() => setCurrentPrompt((p) => randomPrompt(p))}
              onStart={() => setShowPrompt(false)}
              onDismiss={() => setShowPrompt(false)}
              audio={audio}
            />
          )}
          <main
            ref={canvasAreaRef}
            className={
              'canvas-view__canvas-area linen-canvas' +
              (activeTool === 'text' ? ' is-text-mode' : ' is-draw-mode')
            }
            onClick={handleCanvasAreaClick}
            onPointerDown={handleAreaPointerDown}
          >
          {!cameraReady && !cameraError && (
            <div className="canvas-view__loading">Waking up the camera…</div>
          )}
          <Canvas ref={canvasRef} width={areaSize.w} height={areaSize.h} />

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
            holding={isHolding}
            color={activeColor.hex}
            rippleKey={rippleKey}
            eraser={activeTool === 'eraser'}
            eraserSize={Math.max(8, strokeSize)}
          />
          <NowPlaying
            color={activeColor}
            active={isPinching && drawingEnabled}
            bumpKey={noteBumpKey}
          />
        </main>
        </div>
      </div>

      <footer className="canvas-view__footer">
        <div className="canvas-view__footer-actions">
          <button
            type="button"
            className="btn btn--ghost btn--ghost-danger"
            onClick={handleClear}
          >
            <span>{COPY.footer.clear}</span>
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleOpenSave}
          >
            <CheckIcon width="14" height="14" />
            <span>Save</span>
          </button>
        </div>
      </footer>

      <WebcamPiP
        videoRef={videoRef}
        error={cameraError}
        cameraOn={cameraOn}
        onToggleCamera={handleToggleCamera}
        landmarks={landmarks}
        handVisible={handVisible}
        activeTool={activeTool}
      />

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
