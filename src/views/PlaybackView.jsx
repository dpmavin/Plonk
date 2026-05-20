import { useEffect, useState } from 'react';
import { CloseIcon, PlayIcon, PauseIcon, DownloadIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { useAudio } from '../hooks/useAudio';
import './PlaybackView.css';

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PlaybackView({ artwork, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audio = useAudio();

  // Start audio on first user gesture; same pattern as CanvasView
  useEffect(() => {
    if (audio.ready) return undefined;
    const handler = () => audio.start();
    window.addEventListener('pointerdown', handler, { once: true });
    return () => window.removeEventListener('pointerdown', handler);
  }, [audio]);

  // While "playing", loop a soft note from the artwork's mood family
  useEffect(() => {
    if (!isPlaying || !audio.ready) return undefined;
    const family = artwork.mood === 'twilight' ? 'twilight' : 'daydream';
    const id = family === 'twilight' ? 'sage' : 'coral';
    audio.triggerCue('save');
    const interval = setInterval(() => audio.triggerNote(id), 600);
    return () => clearInterval(interval);
  }, [isPlaying, audio, artwork.mood]);

  const downloadImage = () => {
    if (!artwork.imageDataURL) return;
    const a = document.createElement('a');
    a.href = artwork.imageDataURL;
    a.download = `${(artwork.title || 'plonk').replace(/[^a-z0-9-]/gi, '_')}.png`;
    a.click();
  };

  return (
    <div className="playback-view">
      <button
        type="button"
        className="playback-view__close"
        aria-label={COPY.playback.close}
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      <div className="playback-view__content">
        <div className="playback-view__artwork-wrap">
          {artwork.imageDataURL && (
            <img
              className="playback-view__artwork"
              src={artwork.imageDataURL}
              alt={artwork.title || 'Untitled'}
            />
          )}
        </div>

        <div className="playback-view__meta">
          {artwork.title && <h2 className="playback-view__title">{artwork.title}</h2>}
          <div className="playback-view__tags">
            {artwork.prompt && (
              <span className="playback-view__tag">{artwork.prompt}</span>
            )}
            <span className="playback-view__tag playback-view__tag--muted">
              {formatDate(artwork.createdAt)}
            </span>
            {artwork.mood && (
              <span className="playback-view__tag playback-view__tag--mood">
                {artwork.mood}
              </span>
            )}
          </div>
        </div>

        <div className="playback-view__controls">
          <button
            type="button"
            className="playback-view__play"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? COPY.playback.pause : COPY.playback.play}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            className="playback-view__download"
            onClick={downloadImage}
            aria-label={COPY.playback.download}
          >
            <DownloadIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
