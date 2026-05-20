import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';
import './WebcamPiP.css';

export default function WebcamPiP({ videoRef, error }) {
  const [visible, setVisible] = useState(true);

  if (error) {
    return (
      <div className="webcam-pip webcam-pip--error" role="status">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={'webcam-pip' + (visible ? '' : ' is-hidden')}>
      <video
        ref={videoRef}
        className="webcam-pip__video"
        autoPlay
        muted
        playsInline
      />
      <button
        type="button"
        className="webcam-pip__toggle"
        aria-label={visible ? 'Hide webcam preview' : 'Show webcam preview'}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeIcon /> : <EyeOffIcon />}
      </button>
    </div>
  );
}
