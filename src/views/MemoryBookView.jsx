import PlonkLogo from '../components/PlonkLogo';
import { BackIcon, PlayIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { useMemoryBook } from '../hooks/useMemoryBook';
import './MemoryBookView.css';

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MemoryBookView({ onBack, onOpenArtwork }) {
  const { artworks } = useMemoryBook();
  // pinned items first
  const sorted = [...artworks].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="memory-book-view">
      <header className="memory-book-view__header">
        <button
          type="button"
          className="memory-book-view__back"
          aria-label={COPY.headerBackAria}
          onClick={onBack}
        >
          <BackIcon />
        </button>
        <PlonkLogo variant="sm" />
        <h1 className="memory-book-view__title">{COPY.memoryBook.heading}</h1>
        <div className="memory-book-view__header-spacer" />
      </header>

      {sorted.length === 0 ? (
        <div className="memory-book-view__empty">
          <div className="memory-book-view__empty-tile linen-canvas" />
          <p className="memory-book-view__empty-text">{COPY.memoryBook.emptyHeading}</p>
          <button type="button" className="btn btn--primary" onClick={onBack}>
            {COPY.memoryBook.emptyCta}
          </button>
        </div>
      ) : (
        <div className="memory-book-view__grid">
          {sorted.map((art) => (
            <article
              key={art.id}
              className="memory-card"
              onClick={() => onOpenArtwork(art)}
            >
              <div className="memory-card__thumb">
                {art.imageDataURL && (
                  <img src={art.imageDataURL} alt={art.title || 'Untitled'} />
                )}
                {art.pinned && <span className="memory-card__pin">Pinned</span>}
              </div>
              <div className="memory-card__meta">
                <div className="memory-card__meta-text">
                  <div className="memory-card__title">{art.title || 'Untitled plonk'}</div>
                  <div className="memory-card__sub">
                    {art.prompt && <span className="memory-card__prompt">{art.prompt}</span>}
                    <span className="memory-card__date">{formatDate(art.createdAt)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="memory-card__play"
                  aria-label="Play"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenArtwork(art);
                  }}
                >
                  <PlayIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
