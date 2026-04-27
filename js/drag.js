import { drag, CELL, boardOffX, boardOffY, trayPieces } from './state.js';
import { canPlace, placePiece, checkAndClear, hasAnyMove, refillTray } from './logic.js';
import { drawPieceOnCtx, renderTrayPiece, renderAllTray } from './render.js';

export function createFloatCanvas() {
  const floatCanvas = document.createElement('canvas');
  floatCanvas.style.cssText =
    'position:fixed;top:0;left:0;pointer-events:none;z-index:50;display:none;';
  document.body.appendChild(floatCanvas);
  return { floatCanvas, fctx: floatCanvas.getContext('2d') };
}

export function startDrag(pieceIdx, ex, ey, floatCanvas, fctx, boardCanvas) {
  const p = trayPieces[pieceIdx];
  if (!p || p.used) return;

  drag.active = true;
  drag.pieceIdx = pieceIdx;
  drag.curX = ex;
  drag.curY = ey;
  drag.boardRow = null;
  drag.boardCol = null;

  const rows = p.shape.length;
  const cols = p.shape[0].length;
  const fc = CELL;
  floatCanvas.width = cols * fc + 8;
  floatCanvas.height = rows * fc + 8;
  floatCanvas.style.display = 'block';
  fctx.clearRect(0, 0, floatCanvas.width, floatCanvas.height);
  drawPieceOnCtx(fctx, p.shape, p.colorIdx, 4, 4, fc, 0.95);

  moveDragFloat(ex, ey, floatCanvas, boardCanvas);
}

export function moveDragFloat(ex, ey, floatCanvas, boardCanvas) {
  const fw = floatCanvas.width;
  const fh = floatCanvas.height;
  floatCanvas.style.left = `${ex - fw / 2}px`;
  floatCanvas.style.top = `${ey - fh - CELL * 0.5}px`;

  const rect = boardCanvas.getBoundingClientRect();
  const bx = ex - rect.left - boardOffX;
  const by = ey - rect.top - boardOffY + CELL * 0.5;
  const p = trayPieces[drag.pieceIdx];
  if (!p) return;
  drag.boardCol = Math.round(bx / CELL - p.shape[0].length / 2);
  drag.boardRow = Math.round(by / CELL - p.shape.length / 2);
}

export function cancelDragNoPlace(floatCanvas) {
  if (!drag.active) return;
  drag.active = false;
  drag.pointerId = null;
  floatCanvas.style.display = 'none';
  drag.boardRow = null;
  drag.boardCol = null;
}

export function endDrag(
  ex,
  ey,
  floatCanvas,
  boardCanvas,
  pieceCanvases,
  addScoreBound,
  gameOverFn
) {
  if (!drag.active) return;
  drag.active = false;
  drag.pointerId = null;
  floatCanvas.style.display = 'none';

  const p = trayPieces[drag.pieceIdx];
  if (!p) return;

  if (drag.boardRow !== null && canPlace(p.shape, drag.boardRow, drag.boardCol)) {
    placePiece(p.shape, p.colorIdx, drag.boardRow, drag.boardCol);
    trayPieces[drag.pieceIdx].used = true;
    renderTrayPiece(drag.pieceIdx, pieceCanvases);

    checkAndClear(CELL, addScoreBound);

    if (trayPieces.every((tp) => !tp || tp.used)) {
      refillTray(() => renderAllTray(pieceCanvases));
    }

    if (!hasAnyMove()) gameOverFn();
  }

  drag.boardRow = null;
  drag.boardCol = null;
}

export function bindDragControls(
  boardCanvas,
  pieceCanvases,
  floatCanvas,
  fctx,
  addScoreBound,
  gameOverFn
) {
  pieceCanvases.forEach((pc, i) => {
    pc.addEventListener('pointerdown', (e) => {
      const tp = trayPieces[i];
      if (!tp || tp.used) return;
      if (e.button !== 0) return;
      e.preventDefault();
      try {
        pc.setPointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      drag.pointerId = e.pointerId;
      startDrag(i, e.clientX, e.clientY, floatCanvas, fctx, boardCanvas);
    });
    pc.addEventListener('pointermove', (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      e.preventDefault();
      moveDragFloat(e.clientX, e.clientY, floatCanvas, boardCanvas);
    });
    pc.addEventListener('pointerup', (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      e.preventDefault();
      try {
        pc.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      endDrag(e.clientX, e.clientY, floatCanvas, boardCanvas, pieceCanvases, addScoreBound, gameOverFn);
    });
    pc.addEventListener('pointercancel', (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      try {
        pc.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      cancelDragNoPlace(floatCanvas);
    });
  });
}
