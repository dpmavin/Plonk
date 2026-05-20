import { useState } from 'react';
import PlonkLogo from './PlonkLogo';
import { COPY } from '../constants/copy';
import { MVP_PALETTE } from '../constants/palette';
import './OnboardingOverlay.css';

const STEPS = [
  {
    title: COPY.onboarding.step1Title,
    body: COPY.onboarding.step1Body,
    illustration: 'palette',
  },
  {
    title: COPY.onboarding.step2Title,
    body: COPY.onboarding.step2Body,
    illustration: 'pinch',
  },
  {
    title: COPY.onboarding.step3Title,
    body: COPY.onboarding.step3Body,
    illustration: 'notes',
  },
];

export default function OnboardingOverlay({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  const finish = () => {
    try {
      localStorage.setItem('plonk_onboarded', 'true');
    } catch {}
    setLeaving(true);
    setTimeout(() => onComplete?.(), 400);
  };

  const next = () => (isLast ? finish() : setIdx((i) => i + 1));

  return (
    <div className={'onboarding' + (leaving ? ' is-leaving' : '')}>
      <div className="onboarding__card">
        <div className="onboarding__logo">
          <PlonkLogo variant="mono" />
        </div>

        <div className="onboarding__illustration">
          {step.illustration === 'palette' && <PaletteIllustration />}
          {step.illustration === 'pinch' && <PinchIllustration />}
          {step.illustration === 'notes' && <NotesIllustration />}
        </div>

        <h2 className="onboarding__title">{step.title}</h2>
        <p className="onboarding__body">{step.body}</p>

        <div className="onboarding__dots">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={'onboarding__dot' + (i === idx ? ' is-active' : '')}
            />
          ))}
        </div>

        <div className="onboarding__actions">
          <button
            type="button"
            className="onboarding__skip"
            onClick={finish}
          >
            {COPY.onboarding.skip}
          </button>
          <button type="button" className="btn btn--primary" onClick={next}>
            {isLast ? COPY.onboarding.finish : COPY.onboarding.next}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaletteIllustration() {
  return (
    <div className="ob-palette">
      {MVP_PALETTE.map((c) => (
        <span
          key={c.id}
          className="ob-palette__dot"
          style={{ background: c.hex }}
        />
      ))}
    </div>
  );
}

function PinchIllustration() {
  return (
    <div className="ob-pinch">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="14" fill="var(--color-coral)" fillOpacity="0.85">
          <animate
            attributeName="r"
            values="14;9;14"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="60"
          cy="60"
          r="26"
          stroke="var(--color-white)"
          strokeWidth="2"
          strokeOpacity="0.5"
          strokeDasharray="3 4"
        />
      </svg>
    </div>
  );
}

function NotesIllustration() {
  return (
    <div className="ob-notes">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path
          d="M30 90 Q 50 30 90 60"
          stroke="var(--color-lavender)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <text x="38" y="50" fontSize="28" fill="var(--color-mint)">♪</text>
        <text x="62" y="40" fontSize="28" fill="var(--color-yellow)">♫</text>
        <text x="82" y="62" fontSize="28" fill="var(--color-coral)">♪</text>
      </svg>
    </div>
  );
}
