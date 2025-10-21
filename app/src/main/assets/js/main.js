/**
 * THE GRADUATE ESCAPE - Main JavaScript
 * Navigation and click handling for the cover screen
 */

import puzzleManager from './puzzles/puzzle-manager.js';

window.puzzleManager = puzzleManager;

window.resetProgress = () => {
  window.puzzleManager.resetProgress();
};

window.getProgress = () => {
  return window.puzzleManager.getProgress();
};

window.unlockAll = () => {
  window.puzzleManager.unlockAll();
};

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.querySelector('[data-action="start"]');
  const labBtn = document.querySelector('[data-action="lab"]');
  const backgroundBtn = document.querySelector('[data-action="background"]');
  const lockedBtns = document.querySelectorAll('[data-locked="true"]');

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './assets/lab/';
    });
  }

  if (labBtn) {
    labBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './lab/';
    });
  }

  if (backgroundBtn) {
    backgroundBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './background/';
    });
  }

  lockedBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 400);
    });
  });

  const exploreBtn = document.querySelector('.explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './assets/lab/intro.html';
    });
  }

  // General object buttons (not on the map) that trigger puzzles
  const objectBtns = document.querySelectorAll('.object-btn');
  objectBtns.forEach((btn) => {
    if (btn.closest('.map-container')) {
      return; // Skip map objects, handled by interactions.js
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const puzzleType = btn.dataset.puzzle;
      const objectName = btn.dataset.object;
      if (puzzleType) {
        window.puzzleManager.show(puzzleType, objectName);
      }
    });
  });
});
