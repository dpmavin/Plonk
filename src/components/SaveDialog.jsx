import { useState } from 'react';
import { COPY, randomSuggestion } from '../constants/copy';
import './SaveDialog.css';

/**
 * SaveDialog — modal for naming + tagging a save.
 *
 * Props:
 *   onCancel       — () => void
 *   onSave         — ({ title, mood, pinned }) => Promise<void>
 *   defaultMood    — 'daydream' | 'twilight'
 */
export default function SaveDialog({ onCancel, onSave, defaultMood = 'daydream' }) {
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(defaultMood);
  const [pinned, setPinned] = useState(false);
  const [placeholder] = useState(() => randomSuggestion());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const minDisplay = new Promise((r) => setTimeout(r, 800));
    try {
      await Promise.all([
        onSave({ title: title.trim() || placeholder, mood, pinned }),
        minDisplay,
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="save-dialog__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onCancel();
      }}
    >
      <div className="save-dialog" role="dialog" aria-label={COPY.saveDialog.title}>
        <h2 className="save-dialog__title">{COPY.saveDialog.title}</h2>

        <input
          type="text"
          className="save-dialog__input"
          placeholder={placeholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          autoFocus
        />

        <div className="save-dialog__field">
          <label className="save-dialog__label">{COPY.saveDialog.moodLabel}</label>
          <div className="save-dialog__mood" role="radiogroup" aria-label="Mood">
            <button
              type="button"
              role="radio"
              aria-checked={mood === 'daydream'}
              className={'save-dialog__mood-btn' + (mood === 'daydream' ? ' is-selected' : '')}
              onClick={() => setMood('daydream')}
              disabled={saving}
            >
              {COPY.saveDialog.moodDaydream}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mood === 'twilight'}
              className={'save-dialog__mood-btn' + (mood === 'twilight' ? ' is-selected' : '')}
              onClick={() => setMood('twilight')}
              disabled={saving}
            >
              {COPY.saveDialog.moodTwilight}
            </button>
          </div>
        </div>

        <div className="save-dialog__field save-dialog__field--row">
          <label className="save-dialog__label" htmlFor="pin-toggle">
            {COPY.saveDialog.pinLabel}
          </label>
          <button
            id="pin-toggle"
            type="button"
            role="switch"
            aria-checked={pinned}
            className={'save-dialog__switch' + (pinned ? ' is-on' : '')}
            onClick={() => setPinned((p) => !p)}
            disabled={saving}
          >
            <span className="save-dialog__switch-knob" />
          </button>
        </div>

        <div className="save-dialog__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={saving}
          >
            {COPY.saveDialog.cancel}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="save-dialog__spinner" aria-hidden="true" />
                <span>{COPY.saveDialog.saving}</span>
              </>
            ) : (
              <span>{COPY.saveDialog.save}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
