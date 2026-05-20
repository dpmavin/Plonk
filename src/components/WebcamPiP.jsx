import { useState } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  CameraIcon,
  CameraOffIcon,
} from './icons';
import HandSkeleton from './HandSkeleton';
import { useDraggable } from '../hooks/useDraggable';
import './WebcamPiP.css';

/**
 * WebcamPiP — picture-in-picture preview of the webcam with live hand-tracking
 * overlay and a status pill that reflects the current drawing mode.
 *
 * Props:
 *   videoRef        — ref to attach to the <video> element
 *   error           — string|null
 *   cameraOn        — controlled state: is the camera stream live?
 *   onToggleCamera  — () => void  toggles cameraOn at the parent
 *   landmarks       — array of 21 {x, y, z} from useMediaPipe (or empty)
 *   handVisible     — boolean
 *   activeTool      — 'pen' | 'crayon' | 'text' | 'eraser'
 */
export default function WebcamPiP({
  videoRef,
  error,
  cameraOn = true,
  onToggleCamera,
  landmarks = [],
  handVisible = false,
  activeTool = 'pen',
}) {
  const [previewVisible, setPreviewVisible] = useState(true);
  const { ref: dragRef, onPointerDown, style: dragStyle, dragging } = useDraggable();

  if (error) {
    return (
      <div className="webcam-pip webcam-pip--error" role="status">
        <span>{error}</span>
      </div>
    );
  }

  if (!cameraOn) {
    return (
      <div
        ref={dragRef}
        className={'webcam-pip webcam-pip--off' + (dragging ? ' is-dragging' : '')}
        style={dragStyle || undefined}
        onPointerDown={onPointerDown}
      >
        <div className="webcam-pip__placeholder" aria-hidden="true">
          <CameraOffIcon />
        </div>
        <WebcamPiPToolbar
          cameraOn={cameraOn}
          onToggleCamera={onToggleCamera}
          previewVisible={previewVisible}
          onTogglePreview={() => setPreviewVisible((v) => !v)}
        />
      </div>
    );
  }

  const actionLabel =
    activeTool === 'eraser' ? 'ERASE' :
    activeTool === 'text' ? 'TYPE' :
    'DRAW';

  return (
    <div
      ref={dragRef}
      className={
        'webcam-pip' +
        (previewVisible ? '' : ' is-hidden') +
        (dragging ? ' is-dragging' : '')
      }
      style={dragStyle || undefined}
      onPointerDown={onPointerDown}
    >
      <video
        ref={videoRef}
        className="webcam-pip__video"
        autoPlay
        muted
        playsInline
      />

      {previewVisible && (
        <>
          <HandSkeleton landmarks={landmarks} visible={handVisible} />
          <div
            className={
              'webcam-pip__status' + (handVisible ? ' is-tracking' : '')
            }
            aria-live="polite"
          >
            <span className="webcam-pip__status-dot" />
            <span className="webcam-pip__status-text">
              PINCH&nbsp;<span aria-hidden="true">·</span>&nbsp;{actionLabel}
            </span>
          </div>
        </>
      )}

      <WebcamPiPToolbar
        cameraOn={cameraOn}
        onToggleCamera={onToggleCamera}
        previewVisible={previewVisible}
        onTogglePreview={() => setPreviewVisible((v) => !v)}
      />
    </div>
  );
}

function WebcamPiPToolbar({
  cameraOn,
  onToggleCamera,
  previewVisible,
  onTogglePreview,
}) {
  return (
    <div className="webcam-pip__toolbar">
      <button
        type="button"
        className="webcam-pip__btn"
        aria-label={previewVisible ? 'Hide webcam preview' : 'Show webcam preview'}
        onClick={onTogglePreview}
        disabled={!cameraOn}
      >
        {previewVisible ? <EyeIcon /> : <EyeOffIcon />}
      </button>
      <button
        type="button"
        className={'webcam-pip__btn' + (cameraOn ? '' : ' is-off')}
        aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}
        aria-pressed={!cameraOn}
        onClick={onToggleCamera}
      >
        {cameraOn ? <CameraIcon /> : <CameraOffIcon />}
      </button>
    </div>
  );
}
