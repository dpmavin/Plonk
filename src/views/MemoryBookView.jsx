import { BackIcon, PlayIcon } from '../components/icons';
import { COPY } from '../constants/copy';
import { useMemoryBook } from '../hooks/useMemoryBook';
import './MemoryBookView.css';

const DATE_FMT = { month: 'short', day: 'numeric' };

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, DATE_FMT);
}

function formatDuration(seconds) {
  if (seconds == null) return '';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export default function MemoryBookView({ onBack, onOpenArtwork }) {
  const { artworks } = useMemoryBook();
  const sorted = [...artworks].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  const count = sorted.length;
  const subtitle = `${count} plonked moment${count === 1 ? '' : 's'}. Click any tile to play it back, brushstroke by brushstroke.`;

  return (
    <div className="memory-book linen-canvas">
      <header className="memory-book__header">
        <div className="memory-book__title-row">
          <button
            type="button"
            className="memory-book__back"
            aria-label={COPY.headerBackAria}
            onClick={onBack}
          >
            <BackIcon />
          </button>
          <h1 className="memory-book__title">{COPY.memoryBook.heading}</h1>
        </div>
        {count > 0 && <p className="memory-book__subtitle">{subtitle}</p>}
      </header>

      {count === 0 ? (
        <div className="memory-book__empty">
          <div className="memory-book__empty-tile linen-canvas" />
          <p className="memory-book__empty-text">{COPY.memoryBook.emptyHeading}</p>
          <button type="button" className="btn btn--primary" onClick={onBack}>
            {COPY.memoryBook.emptyCta}
          </button>
        </div>
      ) : (
        <div className="memory-book__grid">
          {sorted.map((art) => (
            <MemoryCard
              key={art.id}
              art={art}
              onOpen={() => onOpenArtwork(art)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryCard({ art, onOpen }) {
  const colors = (art.colors_used || []).slice(0, 5);
  const dateLabel = formatDate(art.createdAt);
  const duration = formatDuration(art.duration_seconds);

  return (
    <article className="memory-card" onClick={onOpen}>
      <div className="memory-card__thumb">
        {art.imageDataURL && (
          <img src={art.imageDataURL} alt={art.title || 'Untitled'} />
        )}
        <div className="memory-card__thumb-fade" aria-hidden="true" />
        <button
          type="button"
          className="memory-card__play"
          aria-label={`Play "${art.title || 'Untitled'}"`}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <PlayIcon />
        </button>
      </div>

      <div className="memory-card__meta">
        <h3 className="memory-card__title">{art.title || 'Untitled plonk'}</h3>
        {art.prompt && (
          <p className="memory-card__prompt">&ldquo;{art.prompt}&rdquo;</p>
        )}
        <div className="memory-card__footer">
          <div className="memory-card__dots" aria-hidden="true">
            {colors.map((hex, i) => (
              <span
                key={`${hex}-${i}`}
                className="memory-card__dot"
                style={{ background: hex }}
              />
            ))}
          </div>
          <span className="memory-card__date">
            {dateLabel}
            {duration && (
              <>
                <span className="memory-card__sep">·</span>
                {duration}
              </>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
