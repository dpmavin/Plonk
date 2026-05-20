import './PlonkLogo.css';

export default function PlonkLogo({ variant = 'default' }) {
  // variant: 'default' | 'sm' | 'mono'
  return (
    <span className={`plonk-logo plonk-logo--${variant}`} aria-label="Plonk">
      <span className="plonk-logo__text">
        Pl
        <span className="plonk-logo__o-wrap">
          o<span className="plonk-logo__dot" aria-hidden="true" />
        </span>
        nk
      </span>
    </span>
  );
}
