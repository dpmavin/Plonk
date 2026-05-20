import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'plonk_shared_artworks';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(artworks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
  } catch (err) {
    console.error('useMemoryBook: failed to persist', err);
  }
}

export function useMemoryBook() {
  const [artworks, setArtworks] = useState(() => load());

  // Listen for storage changes across tabs and within-tab custom events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setArtworks(load());
    };
    const onInternal = () => setArtworks(load());
    window.addEventListener('storage', onStorage);
    window.addEventListener('plonk:memorybook-changed', onInternal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('plonk:memorybook-changed', onInternal);
    };
  }, []);

  const addArtwork = useCallback((artwork) => {
    const next = [
      {
        id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        title: '',
        mood: 'daydream',
        pinned: false,
        prompt: '',
        imageDataURL: '',
        ...artwork,
      },
      ...load(),
    ];
    save(next);
    setArtworks(next);
    window.dispatchEvent(new Event('plonk:memorybook-changed'));
  }, []);

  const removeArtwork = useCallback((id) => {
    const next = load().filter((a) => a.id !== id);
    save(next);
    setArtworks(next);
    window.dispatchEvent(new Event('plonk:memorybook-changed'));
  }, []);

  const togglePin = useCallback((id) => {
    const next = load().map((a) =>
      a.id === id ? { ...a, pinned: !a.pinned } : a
    );
    save(next);
    setArtworks(next);
    window.dispatchEvent(new Event('plonk:memorybook-changed'));
  }, []);

  return { artworks, addArtwork, removeArtwork, togglePin };
}
