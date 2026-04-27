import { COLS, ROWS, COLORS, TRAY_CELL } from './constants.js';
import { grid, drag, trayPieces, clearAnim, CELL } from './state.js';
import { canPlace } from './logic.js';

function drawCell(tc, x, y, cell, col, glow) {
  const pad = 1.5;
  const r = Math.min(6, cell * 0.22);
  if (glow) {
    tc.shadowColor = col.glow;
    tc.shadowBlur = 10;
  }
  tc.fillStyle = col.fill;
  tc.beginPath();
  tc.roundRect(x + pad, y + pad, cell - pad * 2, cell - pad * 2, r);
  tc.fill();
  tc.shadowBlur = 0;
  tc.fillStyle = 'rgba(255,255,255,0.22)';
  tc.beginPath();
  tc.roundRect(x + pad + 2, y + pad + 2, cell - pad * 2 - 4, (cell - pad * 2) * 0.38, r);
  tc.fill();
  tc.fillStyle = 'rgba(0,0,0,0.15)';
  const sw = cell - pad * 2 - 4;
  tc.beginPath();
  tc.roundRect(x + pad + 2, y + pad + cell * 0.55, sw, cell * 0.18, 2);
  tc.fill();
}

export function drawPieceOnCtx(tc, shape, colorIdx, ox, oy, cell, alpha) {
  const col = COLORS[colorIdx];
  tc.globalAlpha = alpha;
  shape.forEach((row, r) => {
    row.forEach((v, c) => {
      if (!v) return;
      drawCell(tc, ox + c * cell, oy + r * cell, cell, col, true);
    });
  });
  tc.globalAlpha = 1;
}

export function renderTrayPiece(i, pieceCanvases) {
  const pc = pieceCanvases[i];
  const p = trayPieces[i];
  if (!p || p.used) {
    pc.width = pc.height = 1;
    pc.style.opacity = '0';
    return;
  }
  pc.style.opacity = '1';
  const rows = p.shape.length;
  const cols = p.shape[0].length;
  const pad = 4;
  pc.width = cols * TRAY_CELL + pad * 2;
  pc.height = rows * TRAY_CELL + pad * 2;
  const tc = pc.getContext('2d');
  tc.clearRect(0, 0, pc.width, pc.height);
  drawPieceOnCtx(tc, p.shape, p.colorIdx, pad, pad, TRAY_CELL, 0.9);
}

export function renderAllTray(pieceCanvases) {
  for (let i = 0; i < 3; i++) {
    renderTrayPiece(i, pieceCanvases);
  }
}

export function drawBoard(bctx, boardCanvas) {
  const W2 = boardCanvas.width;
  const H2 = boardCanvas.height;
  bctx.clearRect(0, 0, W2, H2);

  bctx.fillStyle = 'rgba(255,255,255,0.03)';
  bctx.beginPath();
  bctx.roundRect(0, 0, W2, H2, 12);
  bctx.fill();

  const cell = CELL;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * cell;
      const y = r * cell;
      const val = grid[r][c];
      if (val !== null) {
        drawCell(bctx, x, y, cell, COLORS[val], true);
      } else {
        bctx.strokeStyle = 'rgba(255,255,255,0.07)';
        bctx.lineWidth = 0.5;
        bctx.beginPath();
        bctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 4);
        bctx.stroke();
      }
    }
  }

  if (drag.active && drag.boardCol !== null) {
    const p = trayPieces[drag.pieceIdx];
    if (p) {
      const valid = canPlace(p.shape, drag.boardRow, drag.boardCol);
      p.shape.forEach((row, r) => {
        row.forEach((v, c) => {
          if (!v) return;
          const gr = drag.boardRow + r;
          const gc = drag.boardCol + c;
          if (gr < 0 || gr >= ROWS || gc < 0 || gc >= COLS) return;
          const x = gc * cell;
          const y = gr * cell;
          bctx.globalAlpha = valid ? 0.6 : 0.25;
          bctx.fillStyle = valid ? COLORS[p.colorIdx].fill : '#ff4444';
          bctx.beginPath();
          bctx.roundRect(x + 2, y + 2, cell - 4, cell - 4, 5);
          bctx.fill();
          bctx.globalAlpha = 1;
        });
      });
    }
  }

  bctx.shadowBlur = 0;
}

export function updateParticles(bctx, CELL) {
  if (!clearAnim.active) return;
  clearAnim.timer--;
  if (clearAnim.timer <= 0) clearAnim.active = false;
  for (let i = clearAnim.particles.length - 1; i >= 0; i--) {
    const p = clearAnim.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= 0.025;
    if (p.life <= 0) {
      clearAnim.particles.splice(i, 1);
      continue;
    }
    bctx.globalAlpha = p.life;
    bctx.fillStyle = p.color;
    bctx.shadowColor = p.color;
    bctx.shadowBlur = 8;
    bctx.beginPath();
    bctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    bctx.fill();
    bctx.shadowBlur = 0;
    bctx.globalAlpha = 1;
  }
}
