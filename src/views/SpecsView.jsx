import { PALETTE } from '../constants/palette';
import { PROMPTS } from '../constants/prompts';
import { AUDIO_CUES } from '../constants/audioCues';
import './SpecsView.css';

/**
 * SpecsView — dev-only inventory page. Mount with `?specs` query string.
 */
export default function SpecsView() {
  return (
    <div className="specs-view">
      <h1>Plonk Specs</h1>

      <section>
        <h2>Colors → Instruments</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Hex</th>
              <th>Instrument</th>
              <th>Tone Type</th>
              <th>Base Note</th>
              <th>Scale</th>
              <th>Family</th>
            </tr>
          </thead>
          <tbody>
            {PALETTE.map((c) => (
              <tr key={c.id}>
                <td>
                  <span
                    className="specs-view__swatch"
                    style={{ background: c.hex }}
                  />
                </td>
                <td>{c.name}</td>
                <td><code>{c.hex}</code></td>
                <td>{c.instrument}</td>
                <td><code>{c.toneType}</code></td>
                <td><code>{c.baseNote}</code></td>
                <td><code>{c.scaleNotes.join(' ')}</code></td>
                <td>{c.audioFamily}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Audio Cues</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Volume</th>
              <th>Duration</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(AUDIO_CUES).map(([name, cue]) => (
              <tr key={name}>
                <td><code>{name}</code></td>
                <td>{cue.type}</td>
                <td>{cue.volume}</td>
                <td>{cue.duration || '—'}</td>
                <td>{cue.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Prompts</h2>
        <ol>
          {PROMPTS.map((p) => <li key={p}>{p}</li>)}
        </ol>
      </section>
    </div>
  );
}
