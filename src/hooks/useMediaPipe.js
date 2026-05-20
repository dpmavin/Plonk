import { useEffect, useRef, useState } from 'react';

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// Cache the landmarker across hook re-mounts (e.g. StrictMode double-mount).
let landmarkerPromise = null;

async function getHandLandmarker() {
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    const { HandLandmarker, FilesetResolver } = await import(
      '@mediapipe/tasks-vision'
    );
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    return HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  })().catch((err) => {
    // Reset cache so a retry can re-attempt loading
    landmarkerPromise = null;
    throw err;
  });
  return landmarkerPromise;
}

/**
 * useMediaPipe — webcam + MediaPipe HandLandmarker (tasks-vision).
 *
 * Returns:
 *   videoRef          — attach to a <video> element (we set its srcObject here)
 *   landmarks         — array of 21 {x, y, z} normalized [0..1] (mirrored x)
 *   handVisible       — true when a hand is detected
 *   cameraReady       — true once camera stream + model are loaded
 *   error             — string|null
 */
export function useMediaPipe({ enabled = true } = {}) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);

  const [landmarks, setLandmarks] = useState([]);
  const [handVisible, setHandVisible] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      // Reset visible state so callers don't see stale landmarks / handVisible
      // when the camera is toggled off — this is a legitimate sync-from-prop.
      /* eslint-disable react-hooks/set-state-in-effect */
      setHandVisible(false);
      setLandmarks([]);
      setCameraReady(false);
      setError(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      return undefined;
    }
    let cancelled = false;
    let lastVideoTime = -1;

    async function start() {
      try {
        // 1. start webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        // 2. load landmarker (concurrently with camera startup if possible)
        const landmarker = await getHandLandmarker();
        if (cancelled) return;
        landmarkerRef.current = landmarker;
        setCameraReady(true);

        // 3. render loop — detectForVideo per frame
        const loop = () => {
          if (cancelled) return;
          const v = videoRef.current;
          if (v && v.readyState >= 2 && v.currentTime !== lastVideoTime) {
            lastVideoTime = v.currentTime;
            try {
              const results = landmarker.detectForVideo(v, performance.now());
              if (results.landmarks && results.landmarks.length > 0) {
                const hand = results.landmarks[0];
                // Mirror x because we display the video mirrored
                const mirrored = hand.map((lm) => ({
                  x: 1 - lm.x,
                  y: lm.y,
                  z: lm.z,
                }));
                setLandmarks(mirrored);
                setHandVisible(true);
              } else {
                setHandVisible(false);
              }
            } catch {
              // skip frame errors silently to avoid log spam
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error('useMediaPipe init failed', err);
        if (!cancelled) {
          // Common cases: permission denied, no camera, model fetch failed
          const friendly =
            err?.name === 'NotAllowedError'
              ? 'Camera access denied. Reload and grant permission to use hand tracking.'
              : err?.name === 'NotFoundError'
              ? "We couldn't find your camera. You can still draw with your mouse."
              : err?.message || 'Camera unavailable';
          setError(friendly);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      // Keep the cached landmarker — it's expensive to re-init across remounts.
    };
  }, [enabled]);

  return {
    videoRef,
    landmarks,
    handVisible,
    cameraReady,
    error,
  };
}
