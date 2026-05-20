import { useEffect, useRef, useState } from 'react';

/**
 * useMediaPipe — webcam + MediaPipe Hands landmark stream.
 *
 * Returns:
 *   videoRef          — attach to <video> element to render webcam feed
 *   landmarks         — array of 21 {x, y, z} normalized [0..1] (mirrored to match feed)
 *   handVisible       — true when a hand is detected
 *   cameraReady       — true once camera stream and model are loaded
 *   error             — string|null
 */
export function useMediaPipe({ enabled = true } = {}) {
  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  const [landmarks, setLandmarks] = useState([]);
  const [handVisible, setHandVisible] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    async function start() {
      try {
        const [{ Hands }, { Camera }] = await Promise.all([
          import('@mediapipe/hands'),
          import('@mediapipe/camera_utils'),
        ]);

        if (cancelled) return;

        const hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });
        hands.onResults((results) => {
          if (cancelled) return;
          const hand = results.multiHandLandmarks && results.multiHandLandmarks[0];
          if (hand && hand.length > 0) {
            // Mirror x because video is also mirrored
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
        });
        handsRef.current = hands;

        if (!videoRef.current) return;
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch (e) {
                // eat per-frame errors to avoid log spam
              }
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current = camera;
        await camera.start();
        if (!cancelled) setCameraReady(true);
      } catch (err) {
        console.error('useMediaPipe init failed', err);
        if (!cancelled) setError(err.message || 'Camera unavailable');
      }
    }

    start();

    return () => {
      cancelled = true;
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch {}
      }
      if (handsRef.current) {
        try { handsRef.current.close(); } catch {}
      }
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
