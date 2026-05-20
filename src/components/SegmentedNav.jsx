import {
  CanvasIcon,
  MemoryBookIcon,
  PlusCircleIcon,
} from './icons';
import './SegmentedNav.css';

/**
 * SegmentedNav — dark pill containing 3 segments: Canvas / Memory Book / Specs.
 * The active segment is highlighted with a cream pill behind it.
 *
 * Props:
 *   active        — 'canvas' | 'memoryBook' | 'specs'
 *   onCanvas      — () => void
 *   onMemoryBook  — () => void
 *   onSpecs       — () => void (omitted in production)
 */
export default function SegmentedNav({
  active,
  onCanvas,
  onMemoryBook,
  onSpecs,
}) {
  const showSpecs = !!onSpecs;

  return (
    <nav className="segnav" aria-label="Primary">
      <SegnavItem
        id="canvas"
        active={active}
        onClick={onCanvas}
        Icon={CanvasIcon}
        label="Canvas"
      />
      <SegnavItem
        id="memoryBook"
        active={active}
        onClick={onMemoryBook}
        Icon={MemoryBookIcon}
        label="Memory Book"
      />
      {showSpecs && (
        <SegnavItem
          id="specs"
          active={active}
          onClick={onSpecs}
          Icon={PlusCircleIcon}
          label="Specs"
        />
      )}
    </nav>
  );
}

function SegnavItem({ id, active, onClick, Icon, label }) {
  const selected = active === id;
  return (
    <button
      type="button"
      className={'segnav__item' + (selected ? ' is-active' : '')}
      aria-current={selected ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon />
      <span className="segnav__label">{label}</span>
    </button>
  );
}
