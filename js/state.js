import { COLS, ROWS } from './constants.js';

export const drag = {
  active: false,
  pieceIdx: -1,
  pointerId: null,
  startX: 0,
  startY: 0,
  curX: 0,
  curY: 0,
  boardRow: null,
  boardCol: null,
};

export const clearAnim = { active: false, rows: [], cols: [], timer: 0, particles: [] };

export const STARS = [];

export let grid = [];
export let trayPieces = [null, null, null];
export let score = 0;
export let best = 0;
export let CELL = 0;
export let boardOffX = 0;
export let boardOffY = 0;
export let lastT = 0;
export let bgTick = 0;

export function setLastT(v) {
  lastT = v;
}

export function setBgTick(v) {
  bgTick = v;
}
/** 'intro' | 'playing' */
export let phase = 'intro';

export function setPhase(p) {
  phase = p;
}

export function setScore(v) {
  score = v;
}

export function setBest(v) {
  best = v;
}

export function setCell(v) {
  CELL = v;
}

export function initGrid() {
  grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid.push(new Array(COLS).fill(null));
  }
}
