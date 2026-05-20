import { useState } from 'react';
import CanvasView from './views/CanvasView';
import MemoryBookView from './views/MemoryBookView';
import PlaybackView from './views/PlaybackView';
import OnboardingOverlay from './components/OnboardingOverlay';

export default function App() {
  const [view, setView] = useState('canvas'); // 'canvas' | 'memoryBook' | 'playback'
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(
    () => {
      try {
        return localStorage.getItem('plonk_onboarded') === 'true';
      } catch {
        return true;
      }
    }
  );

  const goCanvas = () => {
    setSelectedArtwork(null);
    setView('canvas');
  };
  const goMemoryBook = () => setView('memoryBook');
  const goPlayback = (artwork) => {
    setSelectedArtwork(artwork);
    setView('playback');
  };

  let body;
  if (view === 'memoryBook') {
    body = (
      <MemoryBookView
        onBack={goCanvas}
        onOpenArtwork={goPlayback}
      />
    );
  } else if (view === 'playback' && selectedArtwork) {
    body = (
      <PlaybackView
        artwork={selectedArtwork}
        onClose={() => setView('memoryBook')}
      />
    );
  } else {
    body = <CanvasView onOpenMemoryBook={goMemoryBook} />;
  }

  return (
    <>
      {body}
      {!isOnboarded && (
        <OnboardingOverlay onComplete={() => setIsOnboarded(true)} />
      )}
    </>
  );
}
