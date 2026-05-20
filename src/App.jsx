import { useState } from 'react';
import CanvasView from './views/CanvasView';
import MemoryBookView from './views/MemoryBookView';
import PlaybackView from './views/PlaybackView';
import SpecsView from './views/SpecsView';
import OnboardingOverlay from './components/OnboardingOverlay';
import SegmentedNav from './components/SegmentedNav';
import './App.css';

export default function App() {
  const [view, setView] = useState('canvas'); // 'canvas' | 'memoryBook' | 'playback' | 'specs'
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return localStorage.getItem('plonk_onboarded') === 'true';
    } catch {
      return true;
    }
  });

  // Specs page is dev-only — query string or nav clicks both work in DEV
  const specsAllowed = import.meta.env.DEV;
  if (
    specsAllowed &&
    typeof window !== 'undefined' &&
    window.location.search.includes('specs')
  ) {
    return <SpecsView />;
  }

  const goCanvas = () => {
    setSelectedArtwork(null);
    setView('canvas');
  };
  const goMemoryBook = () => setView('memoryBook');
  const goPlayback = (artwork) => {
    setSelectedArtwork(artwork);
    setView('playback');
  };
  const goSpecs = specsAllowed ? () => setView('specs') : undefined;

  let body;
  if (view === 'memoryBook') {
    body = <MemoryBookView onBack={goCanvas} onOpenArtwork={goPlayback} />;
  } else if (view === 'playback' && selectedArtwork) {
    body = (
      <PlaybackView
        artwork={selectedArtwork}
        onClose={() => setView('memoryBook')}
      />
    );
  } else if (view === 'specs') {
    body = <SpecsView onBack={goCanvas} />;
  } else {
    body = <CanvasView />;
  }

  // Playback is an overlay — hide the nav so it doesn't poke through
  const showNav = view !== 'playback';
  const activeNav =
    view === 'memoryBook' ? 'memoryBook' :
    view === 'specs' ? 'specs' :
    'canvas';

  return (
    <>
      {body}
      {showNav && (
        <div className="app-nav-dock">
          <SegmentedNav
            active={activeNav}
            onCanvas={goCanvas}
            onMemoryBook={goMemoryBook}
            onSpecs={goSpecs}
          />
        </div>
      )}
      {!isOnboarded && (
        <OnboardingOverlay onComplete={() => setIsOnboarded(true)} />
      )}
    </>
  );
}
