import { COLS, ROWS } from './constants.js';
import {
  STARS,
  initGrid,
  setCell,
  setPhase,
  phase,
  score,
  best,
  setScore,
  lastT,
  bgTick,
  setLastT,
  setBgTick,
  CELL,
} from './state.js';
import { loadBest, addScore, refillTray, clearTrayPieces } from './logic.js';
import { drawBoard, updateParticles, renderAllTray } from './render.js';
import { createFloatCanvas, bindDragControls } from './drag.js';

function initStars(w, h) {
  STARS.length = 0;
  for (let i = 0; i < 120; i++) {
    STARS.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),
      speed: 0.003 + Math.random() * 0.008,
    });
  }
}

let bgCanvas;
let bgctx;

function drawBg() {
  const W2 = window.innerWidth;
  const H2 = window.innerHeight;
  bgCanvas.width = W2;
  bgCanvas.height = H2;
  bgctx.fillStyle = '#08001a';
  bgctx.fillRect(0, 0, W2, H2);
  STARS.forEach((s) => {
    s.a += s.speed;
    const alpha = 0.3 + Math.sin(s.a) * 0.5;
    bgctx.globalAlpha = Math.max(0, alpha);
    bgctx.fillStyle = '#fff';
    bgctx.beginPath();
    bgctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgctx.fill();
  });
  bgctx.globalAlpha = 1;
}

const boardCanvas = document.getElementById('board');
const bctx = boardCanvas.getContext('2d');
const pieceCanvases = [
  document.getElementById('pc0'),
  document.getElementById('pc1'),
  document.getElementById('pc2'),
];

const scoreEl = document.getElementById('score-el');
const bestEl = document.getElementById('best-el');
const overlay = document.getElementById('overlay');
const introOverlay = document.getElementById('intro-overlay');
const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreEl = document.getElementById('final-score');
const finalBestEl = document.getElementById('final-best');

const { floatCanvas, fctx } = createFloatCanvas();

function layout() {
  const W2 = window.innerWidth;
  const H2 = window.innerHeight;
  const hudH = document.getElementById('hud').offsetHeight || 60;
  const trayH = 130;
  const available = H2 - hudH - trayH - 20;
  const cell = Math.floor(Math.min(available / ROWS, (W2 * 0.95) / COLS));
  setCell(cell);
  const bw = COLS * cell;
  const bh = ROWS * cell;
  boardCanvas.width = bw;
  boardCanvas.height = bh;
  initStars(W2, H2);
}

function addScoreBound(pts) {
  addScore(pts, scoreEl, bestEl);
}

function gameOver() {
  if (phase !== 'playing') return;
  finalScoreEl.textContent = String(score);
  finalBestEl.textContent =
    score >= best && score > 0 ? '🏆 Новый рекорд!' : `Рекорд: ${best}`;
  overlay.classList.add('show');
}

function beginPlaying() {
  overlay.classList.remove('show');
  introOverlay.classList.remove('show');
  setPhase('playing');
  setScore(0);
  scoreEl.textContent = '0';
  bestEl.textContent = String(best);
  initGrid();
  refillTray(() => renderAllTray(pieceCanvases));
}

function showIntro() {
  overlay.classList.remove('show');
  introOverlay.classList.add('show');
  setPhase('intro');
  setScore(0);
  scoreEl.textContent = '0';
  bestEl.textContent = String(best);
  initGrid();
  clearTrayPieces(() => renderAllTray(pieceCanvases));
}

if (window.Telegram && window.Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

loadBest();
bestEl.textContent = String(best);

bgCanvas = document.createElement('canvas');
bgCanvas.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;';
document.body.appendChild(bgCanvas);
bgctx = bgCanvas.getContext('2d');

layout();
window.addEventListener('resize', () => {
  layout();
});

bindDragControls(boardCanvas, pieceCanvases, floatCanvas, fctx, addScoreBound, gameOver);

playBtn.addEventListener('click', beginPlaying);
playBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  beginPlaying();
}, { passive: false });

restartBtn.addEventListener('click', () => {
  beginPlaying();
});
restartBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  beginPlaying();
}, { passive: false });

showIntro();

function loop(ts) {
  requestAnimationFrame(loop);
  const dt = ts - lastT;
  if (dt < 1000 / 60) return;
  setLastT(ts);
  setBgTick(bgTick + 1);
  if (bgTick % 3 === 0) drawBg();
  drawBoard(bctx, boardCanvas);
  updateParticles(bctx, CELL);
}

requestAnimationFrame(loop);
