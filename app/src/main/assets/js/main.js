/**
 * THE GRADUATE ESCAPE - Main JavaScript
 * 메인 화면의 네비게이션과 API 초기화를 담당합니다.
 */

import gameAPI from './api/game-api.js';
import puzzleManager from './api/puzzle-manager-api.js';

// API와 퍼즐 매니저를 전역에서 접근할 수 있도록 설정 (개발 편의성)
window.gameAPI = gameAPI;
window.puzzleManager = puzzleManager;

// 개발용 편의 함수: 게임 진행 상태를 리셋합니다.
window.resetProgress = () => {
  window.gameAPI.resetProgress();
  // 페이지를 새로고침하여 리셋된 상태를 즉시 반영합니다.
  location.reload(); 
};


document.addEventListener('DOMContentLoaded', () => {

  // --- 시작 버튼 핸들러 --- 
  // 여러 종류의 시작 버튼이 있을 수 있으므로 모두 동일하게 처리합니다.
  const startButtons = [
    document.querySelector('[data-action="start"]'),
    document.querySelector('[data-action="lab"]'),
    document.querySelector('.explore-btn') 
  ];

  const handleStartGame = (e) => {
    e.preventDefault();
    // 인트로 화면으로 이동합니다.
    window.location.href = './lab/intro.html';
  };

  startButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', handleStartGame);
    }
  });


  // --- 기타 버튼 처리 ---

  // 잠긴 버튼들에 대한 처리 (클릭 시 흔들리는 효과)
  const lockedBtns = document.querySelectorAll('[data-locked="true"], .btn.locked');
  lockedBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 400);
    });
  });
});
