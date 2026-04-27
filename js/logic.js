import { COLS, ROWS, COLORS, SHAPES, STORAGE_KEY_BEST, TRAY_CELL } from './constants.js';
import { grid, trayPieces, score, best, clearAnim, setScore, setBest } from './state.js';

function cellCount(shape) {
  let n = 0;
  shape.forEach((row) => {
    row.forEach((v) => {
      if (v) n++;
    });
  });
  return n;
}

export function canPlace(shape, startR, startC) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const gr = startR + r;
      const gc = startC + c;
      if (gr < 0 || gr >= ROWS || gc < 0 || gc >= COLS) return false;
      if (grid[gr][gc] !== null) return false;
    }
  }
  return true;
}

/** Любая клетка поля, куда можно поставить фигуру (в т.ч. с отрицательным смещением bbox). */
export function hasAnyMove() {
  for (let i = 0; i < 3; i++) {
    const p = trayPieces[i];
    if (!p || p.used) continue;
    const shape = p.shape;
    const h = shape.length;
    const w = shape[0].length;
    for (let r = -h + 1; r < ROWS; r++) {
      for (let c = -w + 1; c < COLS; c++) {
        if (canPlace(shape, r, c)) return true;
      }
    }
  }
  return false;
}

export function randomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const colorIdx = Math.floor(Math.random() * COLORS.length);
  return { shape, colorIdx, used: false };
}

function randomPieceFromShapeList(list) {
  const shape = list[Math.floor(Math.random() * list.length)];
  const colorIdx = Math.floor(Math.random() * COLORS.length);
  return { shape, colorIdx, used: false };
}

export function clearTrayPieces(renderAllTray) {
  for (let i = 0; i < 3; i++) {
    trayPieces[i] = null;
  }
  renderAllTray();
}

export function refillTray(renderAllTray) {
  const maxTries = 100;
  for (let attempt = 0; attempt < maxTries; attempt++) {
    for (let i = 0; i < 3; i++) {
      trayPieces[i] = randomPiece();
    }
    if (hasAnyMove()) {
      renderAllTray();
      return;
    }
  }
  const small = SHAPES.filter((s) => cellCount(s) <= 4);
  const pool = small.length ? small : SHAPES;
  for (let i = 0; i < 3; i++) {
    trayPieces[i] = randomPieceFromShapeList(pool);
  }
  if (!hasAnyMove()) {
    const o = [[1, 1], [1, 1]];
    for (let i = 0; i < 3; i++) {
      trayPieces[i] = {
        shape: o,
        colorIdx: Math.floor(Math.random() * COLORS.length),
        used: false,
      };
    }
  }
  renderAllTray();
}

export function placePiece(shape, colorIdx, startR, startC) {
  shape.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v) grid[startR + r][startC + c] = colorIdx;
    });
  });
}

function spawnCellParticles(parts, cx, cy, colorIdx) {
  const col = colorIdx !== null ? COLORS[colorIdx].glow : '#fff';
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 4;
    parts.push({
      x: cx,
      y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 1,
      r: 2 + Math.random() * 4,
      color: col,
    });
  }
}

export function checkAndClear(CELL, addScoreFn) {
  const fullRows = [];
  const fullCols = [];
  for (let r = 0; r < ROWS; r++) {
    if (grid[r].every((v) => v !== null)) fullRows.push(r);
  }
  for (let c = 0; c < COLS; c++) {
    if (grid.every((row) => row[c] !== null)) fullCols.push(c);
  }
  if (!fullRows.length && !fullCols.length) return false;

  const lines = fullRows.length + fullCols.length;
  const bonus = lines > 1 ? lines * lines : 1;
  const pts = (fullRows.length * COLS + fullCols.length * ROWS) * 10 * bonus;
  addScoreFn(pts);

  const parts = [];
  fullRows.forEach((r) => {
    for (let c = 0; c < COLS; c++) {
      spawnCellParticles(parts, c * CELL + CELL / 2, r * CELL + CELL / 2, grid[r][c]);
    }
  });
  fullCols.forEach((c) => {
    for (let r = 0; r < ROWS; r++) {
      if (!fullRows.includes(r)) {
        spawnCellParticles(parts, c * CELL + CELL / 2, r * CELL + CELL / 2, grid[r][c]);
      }
    }
  });

  fullRows.forEach((r) => {
    grid[r] = new Array(COLS).fill(null);
  });
  fullCols.forEach((c) => {
    for (let r = 0; r < ROWS; r++) grid[r][c] = null;
  });

  clearAnim.active = true;
  clearAnim.particles = parts;
  clearAnim.timer = 40;
  return true;
}

export function loadBest() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BEST);
    if (raw == null) return;
    const v = parseInt(raw, 10);
    if (!Number.isNaN(v) && v >= 0) setBest(v);
  } catch (_) {
    /* ignore */
  }
}

export function saveBest() {
  try {
    localStorage.setItem(STORAGE_KEY_BEST, String(best));
  } catch (_) {
    /* ignore */
  }
}

export function addScore(pts, scoreEl, bestEl) {
  setScore(score + pts);
  if (score > best) {
    setBest(score);
    saveBest();
  }
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
}
