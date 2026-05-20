import { useState } from 'react';
import { CloseIcon } from './icons';
import { COPY } from '../constants/copy';
import './PromptCard.css';

/**
 * PromptCard — floating top-center prompt card.
 *
 * Props:
 *   text       — current prompt string
 *   onSkip     — () => void  (request next prompt)
 *   onDismiss  — () => void  (hide card entirely)
 *   audio      — { triggerCue }
 */
export default function PromptCard({ text, onSkip, onDismiss, audio }) {
  const [leaving, setLeaving] = useState(false);

  const animateOut = (after) => {
    setLeaving(true);
    setTimeout(() => {
      after();
      setLeaving(false);
    }, 250);
  };

  return (
    <div
      className={'prompt-card' + (leaving ? ' is-leaving' : '')}
      role="region"
      aria-label="Prompt"
    >
      <p className="prompt-card__text">{text}</p>
      <div className="prompt-card__actions">
        <button
          type="button"
          className="prompt-card__btn"
          onClick={() => {
            audio?.triggerCue('toolTogglePen');
            onSkip();
          }}
        >
          {COPY.prompt.skip}
        </button>
        <button
          type="button"
          className="prompt-card__btn"
          onClick={() => {
            audio?.triggerCue('toolTogglePen');
            animateOut(onDismiss);
          }}
        >
          {COPY.prompt.freestyle}
        </button>
        <button
          type="button"
          className="prompt-card__dismiss"
          aria-label={COPY.prompt.dismissAria}
          onClick={() => animateOut(onDismiss)}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
