import { useState } from 'react';
import CanvasView from './views/CanvasView';
import MemoryBookView from './views/MemoryBookView';
import PlaybackView from './views/PlaybackView';

export default function App() {
  const [view, setView] = useState('canvas'); // 'canvas' | 'memoryBook' | 'playback'
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const goCanvas = () => {
    setSelectedArtwork(null);
    setView('canvas');
  };
  const goMemoryBook = () => setView('memoryBook');
  const goPlayback = (artwork) => {
    setSelectedArtwork(artwork);
    setView('playback');
  };

  if (view === 'memoryBook') {
    return (
      <MemoryBookView
        onBack={goCanvas}
        onOpenArtwork={goPlayback}
      />
    );
  }

  if (view === 'playback' && selectedArtwork) {
    return (
      <PlaybackView
        artwork={selectedArtwork}
        onClose={() => setView('memoryBook')}
      />
    );
  }

  return <CanvasView onOpenMemoryBook={goMemoryBook} />;
}
