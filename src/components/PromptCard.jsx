import { CloseIcon, SparkIcon } from './icons';
import { COPY } from '../constants/copy';
import './PromptCard.css';

/**
 * PromptCard — card-style row above the canvas. Always visible until dismissed.
 *
 * Layout:
 *   [★ gold icon]  TODAY'S PROMPT                        [Skip] [Start] [X]
 *                  Sketch out your next big idea
 *
 * Props:
 *   text       — current prompt string
 *   onSkip     — () => void  (advance to a new random prompt)
 *   onStart    — () => void  (commit to this prompt — hides the card)
 *   onDismiss  — () => void  (close the card entirely)
 *   audio      — { triggerCue }
 */
export default function PromptCard({ text, onSkip, onStart, onDismiss, audio }) {
  return (
    <div className="prompt-card" role="region" aria-label="Today's prompt">
      <div className="prompt-card__icon" aria-hidden="true">
        <SparkIcon />
      </div>

      <div className="prompt-card__body">
        <span className="prompt-card__label">{COPY.promptRow.label}</span>
        <p className="prompt-card__text">{text}</p>
      </div>

      <div className="prompt-card__actions">
        <button
          type="button"
          className="prompt-card__skip"
          onClick={() => {
            audio?.triggerCue('toolTogglePen');
            onSkip();
          }}
        >
          {COPY.promptRow.skip}
        </button>
        <button
          type="button"
          className="prompt-card__start"
          onClick={() => {
            audio?.triggerCue('pinchStart');
            onStart();
          }}
        >
          {COPY.promptRow.start}
        </button>
        <button
          type="button"
          className="prompt-card__dismiss"
          aria-label={COPY.promptRow.dismissAria}
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
