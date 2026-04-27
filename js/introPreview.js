import { COLORS } from './constants.js';

const COLS = 6;
const ROWS = 4;
const PAD = 12;
const CELL = 24;
const BW = COLS * CELL;
const BH = ROWS * CELL;
const LOGICAL_W = BW + PAD * 2;
const LOGICAL_H = BH + PAD + 20;

const shapeI = [[1, 1, 1]];

let canvas;
let ctx;
let running = false;
let rafId = 0;
let t0 = 0;

function drawCell(c, x, y, cell, col) {
  const p = 1.5;
  const rad = Math.min(6, cell * 0.2);
  c.fillStyle = col.fill;
  c.beginPath();
  c.roundRect(x + p, y + p, cell - p * 2, cell - p * 2, rad);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.2)';
  c.beginPath();
  c.roundRect(x + p + 1, y + p + 1, cell - p * 2 - 2, (cell - p * 2) * 0.35, rad);
  c.fill();
}

function drawGrid(c, cell, grid) {
  c.fillStyle = 'rgba(255,255,255,0.05)';
  c.beginPath();
  c.roundRect(PAD, PAD, BW, BH, 8);
  c.fill();
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const x = PAD + col * cell;
      const y = PAD + r * cell;
      const v = grid[r][col];
      if (v !== null) {
        drawCell(c, x, y, cell, COLORS[v]);
      } else {
        c.strokeStyle = 'rgba(255,255,255,0.07)';
        c.lineWidth = 0.5;
        c.beginPath();
        c.roundRect(x + 0.5, y + 0.5, cell - 1, cell - 1, 3);
        c.stroke();
      }
    }
  }
}

function drawFloatingPiece(c, cell, colIdx, gx, gy, alpha) {
  c.globalAlpha = alpha;
  shapeI.forEach((row, r) => {
    row.forEach((v, col) => {
      if (!v) return;
      drawCell(c, gx + col * cell, gy + r * cell, cell, COLORS[colIdx]);
    });
  });
  c.globalAlpha = 1;
}

/** Нижний ряд: три дырки под палку I (колонки 1–3). */
function makeBaseGrid() {
  const g = [];
  for (let r = 0; r < ROWS; r++) {
    g.push(new Array(COLS).fill(null));
  }
  const br = ROWS - 1;
  g[br][0] = 0;
  g[br][4] = 4;
  g[br][5] = 5;
  g[br - 1][0] = 1;
  g[br - 1][1] = 2;
  g[br - 1][4] = 3;
  g[br - 1][5] = 5;
  return g;
}

function cloneGrid(g) {
  return g.map((row) => row.slice());
}

function setupCanvas(el) {
  canvas = el;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(LOGICAL_W * dpr);
  canvas.height = Math.floor(LOGICAL_H * dpr);
  canvas.style.width = `${LOGICAL_W}px`;
  canvas.style.height = `${LOGICAL_H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function easeOutCubic(x) {
  return 1 - (1 - x) ** 3;
}

function frame(now) {
  if (!running || !ctx) return;
  rafId = requestAnimationFrame(frame);
  if (!t0) t0 = now;
  const t = ((now - t0) / 1000) % 5.2;
  const base = makeBaseGrid();
  const br = ROWS - 1;
  const landX = PAD + 1 * CELL;
  const landY = PAD + br * CELL;

  let grid = cloneGrid(base);
  let floatX = PAD - CELL * 3.5;
  let floatY = PAD + CELL * 0.4;
  let showFloat = false;
  let flash = 0;

  if (t < 1.8) {
    const u = easeOutCubic(t / 1.8);
    floatX = PAD - CELL * 3.5 + (landX - (PAD - CELL * 3.5)) * u;
    floatY = landY - CELL * 0.85 + Math.sin(t * 5) * 1.5;
    showFloat = true;
  } else if (t < 2.05) {
    grid = cloneGrid(base);
    grid[br][1] = 6;
    grid[br][2] = 6;
    grid[br][3] = 6;
    flash = (t - 1.8) / 0.25;
  } else if (t < 2.55) {
    grid = cloneGrid(base);
    grid[br][1] = 6;
    grid[br][2] = 6;
    grid[br][3] = 6;
    const u = (t - 2.05) / 0.5;
    if (u >= 0.35) {
      for (let c = 0; c < COLS; c++) {
        grid[br][c] = null;
      }
    }
  } else {
    grid = cloneGrid(base);
  }

  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
  drawGrid(ctx, CELL, grid);

  if (showFloat) {
    drawFloatingPiece(ctx, CELL, 6, floatX, floatY, 0.95);
  }

  if (flash > 0 && flash <= 1) {
    ctx.save();
    const a = 0.2 + 0.25 * Math.sin(flash * Math.PI);
    ctx.fillStyle = `rgba(255,214,0,${a})`;
    ctx.fillRect(PAD, landY, BW, CELL);
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 11px Arial,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('укладывай блоки · полный ряд исчезает', LOGICAL_W / 2, LOGICAL_H - 5);
}

export function startIntroPreview(canvasEl) {
  stopIntroPreview();
  if (!canvasEl) return;
  setupCanvas(canvasEl);
  running = true;
  t0 = 0;
  rafId = requestAnimationFrame(frame);
}

export function stopIntroPreview() {
  running = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  t0 = 0;
}
