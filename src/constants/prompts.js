export const PROMPTS = [
  'Sketch out your next big idea',
  'Map out a dream',
  'Visualize a feeling',
  "Draw what's on your mind right now",
  'Map your week — what does it look like?',
  'Sketch a memory worth keeping',
  "Visualize what's possible",
  'Plonk a thought down',
  'Draw your mood today',
  'What would your ideal day look like?',
];

export function randomPrompt(exclude) {
  const pool = exclude ? PROMPTS.filter((p) => p !== exclude) : PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
