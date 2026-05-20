import { useState } from 'react';
import { PenIcon, CrayonIcon, TextIcon } from './icons';
import { MVP_PALETTE } from '../constants/palette';
import { COPY } from '../constants/copy';
import './ToolPanel.css';

const TOOLS = [
  { id: 'pen', label: COPY.toolPanel.penTooltip, Icon: PenIcon },
  { id: 'crayon', label: COPY.toolPanel.crayonTooltip, Icon: CrayonIcon },
  { id: 'text', label: COPY.toolPanel.textTooltip, Icon: TextIcon },
];

export default function ToolPanel({
  activeColor,
  onSelectColor,
  activeTool,
  onSelectTool,
  strokeSize,
  onChangeSize,
  audio,
}) {
  const [poppingId, setPoppingId] = useState(null);

  const handleColor = (color) => {
    onSelectColor(color);
    setPoppingId(color.id);
    audio?.triggerCue('colorSelect');
    setTimeout(() => setPoppingId(null), 320);
  };

  const handleTool = (id) => {
    onSelectTool(id);
    const cueName =
      id === 'pen' ? 'toolTogglePen' :
      id === 'crayon' ? 'toolToggleCrayon' :
      'toolToggleText';
    audio?.triggerCue(cueName);
  };

  const handleSize = (n) => {
    onChangeSize(n);
    audio?.triggerCue('sizeAdjust');
  };

  return (
    <aside className="tool-panel" aria-label="Tools">
      {/* Color swatches */}
      <div className="tool-panel__swatches" role="radiogroup" aria-label="Color">
        {MVP_PALETTE.map((color) => {
          const selected = activeColor.id === color.id;
          return (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${color.name} — ${color.instrument}`}
              className={
                'tool-panel__swatch' +
                (selected ? ' is-selected' : '') +
                (poppingId === color.id ? ' is-popping' : '')
              }
              style={{
                '--swatch-hex': color.hex,
              }}
              onClick={() => handleColor(color)}
            >
              <span className="tool-panel__swatch-tooltip">
                {color.name} · {color.instrument}
              </span>
            </button>
          );
        })}
      </div>

      <div className="tool-panel__divider" />

      {/* Tool icons */}
      <div className="tool-panel__tools" role="radiogroup" aria-label="Tool">
        {TOOLS.map(({ id, label, Icon }) => {
          const selected = activeTool === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label}
              className={'tool-panel__tool' + (selected ? ' is-selected' : '')}
              onClick={() => handleTool(id)}
            >
              <Icon />
              <span className="tool-panel__swatch-tooltip">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="tool-panel__divider" />

      {/* Stroke size slider — vertical */}
      <div className="tool-panel__size" aria-label={COPY.toolPanel.sizeLabel}>
        <input
          type="range"
          min={3}
          max={32}
          step={1}
          value={strokeSize}
          onChange={(e) => handleSize(Number(e.target.value))}
          className="tool-panel__size-input"
          style={{ '--accent': activeColor.hex }}
          aria-label={COPY.toolPanel.sizeLabel}
        />
        <div className="tool-panel__size-dots" aria-hidden="true">
          <span className="dot dot--s" />
          <span className="dot dot--m" />
          <span className="dot dot--l" />
        </div>
      </div>
    </aside>
  );
}
