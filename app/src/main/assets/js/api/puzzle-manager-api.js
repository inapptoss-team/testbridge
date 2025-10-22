/**
 * API 기반 퍼즐 매니저
 * 기존 PuzzleManager를 백엔드 API와 연동하도록 수정
 */

import gameAPI from './game-api.js';

class PuzzleManagerAPI {
    constructor() {
        this.puzzleModal = document.getElementById('puzzleModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.puzzleContent = document.getElementById('puzzleContent');
        this.puzzleInput = document.getElementById('puzzleInput');
        this.submitBtn = document.getElementById('submitAnswer');
        this.closeBtn = document.getElementById('closeModal');
        this.currentPuzzleId = null;
        this.playerPuzzles = [];

        this.attachEventListeners();
        this.loadPlayerPuzzles();
    }

    attachEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }
        if (this.puzzleModal) {
            this.puzzleModal.addEventListener('click', (e) => {
                if (e.target === this.puzzleModal) {
                    this.hide();
                }
            });
        }
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', () => this.checkAnswer());
        }
        if (this.puzzleInput) {
            this.puzzleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        }
    }

    /**
     * 플레이어 퍼즐 데이터 로드
     */
    async loadPlayerPuzzles() {
        try {
            this.playerPuzzles = await gameAPI.getPlayerPuzzles();
            console.log('플레이어 퍼즐 데이터 로드 완료:', this.playerPuzzles);
        } catch (error) {
            console.error('퍼즐 데이터 로드 실패:', error);
            this.showError('퍼즐 데이터를 불러오는데 실패했습니다.');
        }
    }

    /**
     * 퍼즐 표시
     */
    async show(puzzleId, objectName = '오브젝트') {
        try {
            if (this.playerPuzzles.length === 0) {
                await this.loadPlayerPuzzles();
            }

            const puzzle = this.playerPuzzles.find(p => p.id === puzzleId);
            if (!puzzle) {
                console.error(`Puzzle with id "${puzzleId}" not found.`);
                this.showError('퍼즐을 찾을 수 없습니다.');
                return;
            }

            // --- ✨ 수정된 부분: 잠금/완료 상태 확인 강화 --- 
            if (puzzle.isLocked) {
                this.showLockedMessage(puzzle.lockedMessage || '아직은 이 퍼즐을 열 수 없습니다. 다른 단서를 먼저 찾아보세요.');
                return;
            }

            if (puzzle.isCompleted) {
                this.showCompletedMessage(puzzle);
                return;
            }
            // --- 여기까지 --- 

            // 퍼즐 표시
            this.currentPuzzleId = puzzleId;
            this.modalTitle.textContent = puzzle.title;

            if (puzzle.type === 'storage-clue' || puzzle.type === 'paper-clue') {
                this.puzzleContent.innerHTML = `<p style="font-size: 1.1rem; color: #a6d8ff;">${puzzle.question}</p>`;
                this.puzzleInput.style.display = 'none';
                this.submitBtn.style.display = 'none';
            } else if (puzzle.type === 'drag-drop') {
                this.puzzleInput.style.display = 'none';
                this.submitBtn.style.display = 'none';
                this.loadHtmlPuzzle('../../puzzles/puzzle01.html', '.chair-puzzle-container', objectName, this.initChairPuzzle.bind(this), false);
            } else if (puzzle.type === 'cabinet-lock') {
                this.puzzleInput.style.display = 'none';
                this.submitBtn.style.display = 'none';
                this.loadHtmlPuzzle('../../puzzles/puzzle02.html', '.cabinet-puzzle-container', objectName, this.initCabinetPuzzle.bind(this), false);
            } else if (puzzle.type === 'mirror-code') {
                this.puzzleInput.style.display = 'none';
                this.submitBtn.style.display = 'none';
                this.loadHtmlPuzzle('../../puzzles/puzzle03.html', '.mirror-puzzle-container', objectName, this.initMirrorPuzzle.bind(this), false);
            } else {
                this.puzzleContent.innerHTML = `<p>${puzzle.question}</p>`;
                this.puzzleInput.style.display = 'block';
                this.submitBtn.style.display = 'block';
                this.puzzleInput.value = '';
                this.submitBtn.textContent = '확인';
                this.submitBtn.onclick = null;
                this.puzzleInput.focus();
            }

            this.puzzleContent.style.opacity = '1';

            if (this.puzzleModal.classList.contains('show')) {
                this.puzzleContent.style.opacity = '0';
                setTimeout(() => this.puzzleContent.style.opacity = '1', 300);
            } else {
                this.puzzleContent.style.opacity = '0';
                this.puzzleModal.classList.add('show');
                setTimeout(() => this.puzzleContent.style.opacity = '1', 100);
            }

        } catch (error) {
            console.error('퍼즐 표시 실패:', error);
            this.showError('퍼즐을 불러오는데 실패했습니다.');
        }
    }

    /**
     * 정답 확인
     */
    async checkAnswer() {
        if (!this.currentPuzzleId) return;

        try {
            const userAnswer = this.puzzleInput.value.toLowerCase().trim();
            const response = await gameAPI.submitPuzzleAnswer(this.currentPuzzleId, userAnswer);

            if (response.success) {
                this.puzzleContent.innerHTML = `<p style="color: #00ff00; font-weight: bold;">✅ ${response.message}</p>`;
                this.puzzleInput.style.display = 'none';
                this.submitBtn.textContent = '다음으로';

                await this.completePuzzle(this.currentPuzzleId);

                this.submitBtn.onclick = () => {
                    this.hide();
                    if (response.nextScene) {
                        this.handleNextScene(response.nextScene);
                    }
                };
            } else {
                this.puzzleContent.innerHTML += `<p style="color: #ff6b6b; font-weight: bold;">❌ ${response.message}</p>`;
                this.puzzleInput.value = '';
                this.puzzleInput.focus();
            }
        } catch (error) {
            console.error('정답 확인 실패:', error);
            this.showError('정답 확인 중 오류가 발생했습니다.');
        }
    }

    /**
     * 퍼즐 완료 처리
     */
    async completePuzzle(puzzleId) {
        try {
            await gameAPI.completePuzzle(puzzleId);
            await this.loadPlayerPuzzles();
            console.log(`퍼즐 ${puzzleId} 완료 처리됨`);
        } catch (error) {
            console.error('퍼즐 완료 처리 실패:', error);
        }
    }

    /**
     * 퍼즐 숨기기
     */
    hide() {
        this.puzzleModal.classList.remove('show');
        this.currentPuzzleId = null;
    }

    /**
     * 다음 장면 처리
     */
    handleNextScene(sceneType) {
        console.log(`다음 장면: ${sceneType}`);
        
        if (sceneType === 'show-paper') {
            const paperElement = document.querySelector('.map-paper');
            if (paperElement) {
                paperElement.style.display = 'block';
            }
        } else if (sceneType === 'storage-sound') {
            this.showNotification('창고에서 무슨 소리가 난 것 같다.');
        }
    }

    /**
     * HTML 퍼즐 로드
     */
    loadHtmlPuzzle(url, selector, objectName, callback, transition = true) {
        const doLoad = () => {
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const puzzleContainer = doc.querySelector(selector);
                    if (puzzleContainer) {
                        this.puzzleContent.innerHTML = '';
                        this.puzzleContent.appendChild(puzzleContainer);
                        if (callback) {
                            setTimeout(callback, 100);
                        }
                    } else {
                        this.puzzleContent.innerHTML = '<p>퍼즐 콘텐츠를 찾을 수 없습니다.</p>';
                    }
                    if (transition) {
                        this.puzzleContent.style.opacity = '1';
                    }
                })
                .catch(error => {
                    console.error('퍼즐 파일을 불러오는 데 실패했습니다:', error);
                    this.puzzleContent.innerHTML = '<p>퍼즐을 불러오는 데 실패했습니다.</p>';
                    if (transition) {
                        this.puzzleContent.style.opacity = '1';
                    }
                });
        };
        
        if (transition) {
            this.puzzleContent.style.opacity = '0';
            setTimeout(doLoad, 300);
        } else {
            doLoad();
        }
    }

    // --- 이하 퍼즐 초기화 로직 (initChairPuzzle, initCabinetPuzzle, initMirrorPuzzle)은 기존과 동일하게 유지됩니다. ---

    async initChairPuzzle() {
        const chairItems = document.querySelectorAll('.chair-item');
        const feedback = document.getElementById('puzzleFeedback');
        const tableCenter = document.querySelector('.table-center');
        if (!chairItems.length || !feedback || !tableCenter) return;
        let chairStates = [0, 0, 0, 0, 0, 0, 0, 0];
        const updateUI = () => { feedback.textContent = `CODE: ${chairStates.join('')}`; };
        const checkCompletion = async () => {
            const response = await gameAPI.submitPuzzleAnswer('chair-puzzle', chairStates.join(''));
            if (response.success) {
                await this.completePuzzle('chair-puzzle');
                this.showNotification(response.message);
                setTimeout(() => { this.hide(); if (response.nextScene) this.handleNextScene(response.nextScene); }, 1500);
            } else { this.showNotification('틀렸습니다.'); }
        };
        chairItems.forEach(chair => chair.addEventListener('click', () => { chairStates[parseInt(chair.dataset.chair) - 1] ^= 1; updateUI(); }));
        document.getElementById('confirmChairPuzzle')?.addEventListener('click', checkCompletion);
        updateUI();
    }

    async initCabinetPuzzle() {
        const elementButtons = document.querySelectorAll('.element-btn');
        if (!elementButtons.length) return;
        elementButtons.forEach(button => button.addEventListener('click', async () => {
            const response = await gameAPI.submitPuzzleAnswer('cabinet-puzzle', button.dataset.element);
            if (response.success) {
                await this.completePuzzle('cabinet-puzzle');
                this.showNotification(response.message);
                setTimeout(() => { this.hide(); if (response.nextScene) this.handleNextScene(response.nextScene); }, 2000);
            } else { button.classList.add('wrong'); setTimeout(() => button.classList.remove('wrong'), 500); }
        }));
    }

    async initMirrorPuzzle() {
        const codeInput = document.getElementById('mirrorCodeInput');
        const confirmBtn = document.getElementById('confirmMirrorPuzzle');
        if (!codeInput || !confirmBtn) return;
        confirmBtn.addEventListener('click', async () => {
            const answer = codeInput.value.trim();
            if (answer.length !== 4) return;
            const response = await gameAPI.submitPuzzleAnswer('mirror-puzzle', answer);
            if (response.success) {
                await this.completePuzzle('mirror-puzzle');
                this.showNotification('🎉 STAGE1 실험실 CLEAR 🎉');
                setTimeout(() => { this.hide(); if (response.nextScene) this.handleNextScene(response.nextScene); }, 1500);
            } else { codeInput.classList.add('wrong'); codeInput.value = ''; setTimeout(() => codeInput.classList.remove('wrong'), 500); }
        });
    }

    // --- ✨ 새로 추가된/수정된 헬퍼 함수들 --- 

    /**
     * 잠긴 퍼즐 메시지 표시
     */
    showLockedMessage(message) {
        this.modalTitle.textContent = '잠겨 있음';
        this.puzzleContent.innerHTML = `<p style="color: #ffb8b8;">${message}</p>`;
        this.puzzleInput.style.display = 'none';
        this.submitBtn.style.display = 'block';
        this.submitBtn.textContent = '닫기';
        this.submitBtn.onclick = () => this.hide();
        this.puzzleModal.classList.add('show');
    }

    /**
     * 완료된 퍼즐 메시지 표시
     */
    showCompletedMessage(puzzle) {
        this.modalTitle.textContent = puzzle.title;
        this.puzzleContent.innerHTML = `<p style="color: #5fff9f; font-weight: bold;">✅ 이미 해결한 퍼즐입니다.</p>`;
        this.puzzleInput.style.display = 'none';
        this.submitBtn.style.display = 'block';
        this.submitBtn.textContent = '닫기';
        this.submitBtn.onclick = () => this.hide();
        this.puzzleModal.classList.add('show');
    }

    /**
     * 알림 표시
     */
    showNotification(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, duration);
    }
    
    /**
     * 에러 메시지 표시
     */
    showError(message) {
        this.modalTitle.textContent = '오류';
        this.puzzleContent.innerHTML = `<p style="color: #ff6b6b;">${message}</p>`;
        this.puzzleInput.style.display = 'none';
        this.submitBtn.style.display = 'block';
        this.submitBtn.textContent = '닫기';
        this.submitBtn.onclick = () => this.hide();
        this.puzzleModal.classList.add('show');
    }
}

export default new PuzzleManagerAPI();
