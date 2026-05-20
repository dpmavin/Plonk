export const COPY = {
  tagline: 'Sketch your ideas. Hear them plonk.',

  headerMemoryBookAria: 'Open your Memory Book',
  headerBackAria: 'Back to canvas',

  toolPanel: {
    penTooltip: 'Pen',
    crayonTooltip: 'Crayon',
    textTooltip: 'Text',
    sizeLabel: 'Stroke size',
  },

  footer: {
    clear: 'Clear',
    save: 'Save to Memory Book',
  },

  saveDialog: {
    title: 'Save your creation',
    titlePlaceholderFallback: 'Give your creation a name…',
    moodLabel: 'Mood',
    moodDaydream: 'Daydream',
    moodTwilight: 'Twilight',
    pinLabel: 'Pin to top',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving…',
  },

  toast: {
    saved: 'Saved to your Memory Book',
  },

  memoryBook: {
    heading: 'Memory Book',
    emptyHeading: 'Nothing here yet. Go plonk something.',
    emptyCta: 'Start creating',
  },

  playback: {
    play: 'Play',
    pause: 'Pause',
    close: 'Close',
    download: 'Download',
  },

  onboarding: {
    step1Title: 'Pick a color',
    step1Body: 'Each color is its own instrument.',
    step2Title: 'Pinch to draw',
    step2Body: 'Touch your thumb and finger to draw on the canvas.',
    step3Title: 'Hear it plonk',
    step3Body: 'Every stroke sings. Your sketch is a song.',
    next: 'Next',
    finish: "Let's go",
    skip: 'Skip tour',
  },

  prompt: {
    skip: 'Skip',
    freestyle: 'Freestyle',
    dismissAria: 'Dismiss prompt',
  },

  errors: {
    cameraNotFound: "We couldn't find your camera. You can still draw with your mouse.",
    audioFailed: 'Having trouble loading sounds. Try refreshing.',
    saveFailed: 'Something went wrong saving. Your art is still here.',
  },
};

// Rotating suggestion placeholders for the save dialog title field
export const SUGGESTIONS = [
  'Sketch of something good',
  'A thought I had today',
  'Untitled plonk',
  'The big idea',
  'Something soft',
  'A moment in color',
  'Feelings, mostly',
  'Work in progress',
  'A quiet afternoon',
  "This one's for me",
];

export function randomSuggestion() {
  return SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
}
