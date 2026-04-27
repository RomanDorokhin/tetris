export const COLS = 8;
export const ROWS = 8;
export const TRAY_CELL = 30;
export const STORAGE_KEY_BEST = 'spacepuzzle-best';

export const COLORS = [
  { fill: '#7c3aed', glow: '#a78bfa', name: 'Фиолетовый' },
  { fill: '#0ea5e9', glow: '#38bdf8', name: 'Синий' },
  { fill: '#059669', glow: '#34d399', name: 'Зелёный' },
  { fill: '#dc2626', glow: '#f87171', name: 'Красный' },
  { fill: '#d97706', glow: '#fbbf24', name: 'Оранжевый' },
  { fill: '#db2777', glow: '#f472b6', name: 'Розовый' },
  { fill: '#0891b2', glow: '#22d3ee', name: 'Голубой' },
];

export const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1], [1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[1, 1, 1, 1, 1]],
  [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
  [[1], [1], [1], [1]],
  [[1, 0], [1, 1], [0, 1]],
  [[1, 1], [1, 0]],
  [[0, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 0, 0], [1, 1, 1]],
  [[1, 1, 1, 1], [0, 0, 0, 1]],
];
