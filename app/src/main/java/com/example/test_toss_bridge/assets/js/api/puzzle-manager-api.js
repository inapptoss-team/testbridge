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
            // 플레이어 퍼즐 데이터가 없으면 다시 로드
            if (this.playerPuzzles.length === 0) {
                await this.loadPlayerPuzzles();
            }

            // 퍼즐 찾기
            const puzzle = this.playerPuzzles.find(p => p.id === puzzleId);
            if (!puzzle) {
                console.error(`Puzzle with id "${puzzleId}" not found.`);
                this.showError('퍼즐을 찾을 수 없습니다.');
                return;
            }

            // 잠금 상태 확인
            if (puzzle.isLocked) {
                this.showLockedWithHandler(puzzleId);
                return;
            }

            // 완료 상태 확인
            if (puzzle.isCompleted) {
                this.showCompletedMessage(puzzle);
                return;
            }

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
                this.loadHtmlPuzzle('../puzzles/puzzle01.html', '.chair-puzzle-container', objectName, this.initChairPuzzle.bind(this), false);
            } else if (puzzle.type === 'cabinet-lock') {
                this.puzzleInput.style.display = 'none';
                this.submitBtn.style.display = 'none';
                this.loadHtmlPuzzle('../puzzles/puzzle02.html', '.cabinet-puzzle-container', objectName, this.initCabinetPuzzle.bind(this), false);
            } else if (puzzle.type === 'mirror-code') {
                this.puzzleInput.style.display = 'none';
                this.submitBtn.style.display = 'none';
                this.loadHtmlPuzzle('../puzzles/puzzle03.html', '.mirror-puzzle-container', objectName, this.initMirrorPuzzle.bind(this), false);
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

                // 퍼즐 완료 처리
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
            // 퍼즐 데이터 다시 로드
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
     * HTML 퍼즐 로드 (기존 로직 유지)
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

    /**
     * 의자 퍼즐 초기화 (기존 로직 유지하되 API 연동)
     */
    async initChairPuzzle() {
        // 기존 의자 퍼즐 로직 유지하되, 완료 시 API 호출
        const chairItems = document.querySelectorAll('.chair-item');
        const feedback = document.getElementById('puzzleFeedback');
        const tableCenter = document.querySelector('.table-center');
        const arrangementArea = document.querySelector('.arrangement-area');
        
        if (!chairItems.length || !feedback || !tableCenter || !arrangementArea) {
            console.error("Chair puzzle elements not found");
            return;
        }
        
        let chairStates = [0, 0, 0, 0, 0, 0, 0, 0];
        
        const updateUI = () => {
            feedback.textContent = `CODE: ${chairStates.join('')}`;
            
            chairItems.forEach((chair) => {
                const chairNum = parseInt(chair.dataset.chair);
                const state = chairStates[chairNum - 1];
                const targetZone = document.querySelector(`.drop-zone[data-position="${chairNum}"]`);

                if (targetZone && !targetZone.contains(chair)) {
                    targetZone.appendChild(chair);
                }

                if (state === 1) {
                    const chairIndex = chairNum - 1;
                    const angle = (chairIndex * 2 * Math.PI) / 8;
                    const EJECT_DELTA = 40; // 적절한 값으로 설정
                    const translateX = Math.cos(angle) * EJECT_DELTA;
                    const translateY = Math.sin(angle) * EJECT_DELTA;
                    
                    chair.style.transform = `translate(${translateX}px, ${translateY}px)`;
                } else {
                    chair.style.transform = 'translate(0px, 0px)';
                }
            });
        };

        const checkCompletion = async () => {
            const answer = chairStates.join('');
            try {
                const response = await gameAPI.submitPuzzleAnswer('chair-puzzle', answer);
                
                if (response.success) {
                    await this.completePuzzle('chair-puzzle');
                    this.showNotification(response.message);
                    
                    setTimeout(() => {
                        this.hide();
                        if (response.nextScene) {
                            this.handleNextScene(response.nextScene);
                        }
                    }, 1500);
                } else {
                    this.showNotification('틀렸습니다. 다시 시도해보세요.');
                }
            } catch (error) {
                console.error('의자 퍼즐 완료 확인 실패:', error);
                this.showError('퍼즐 확인 중 오류가 발생했습니다.');
            }
        };

        chairItems.forEach(chair => {
            chair.addEventListener('click', () => {
                const chairNum = parseInt(chair.dataset.chair);
                chairStates[chairNum - 1] = 1 - chairStates[chairNum - 1];
                updateUI();
            });
        });
        
        const confirmBtn = document.getElementById('confirmChairPuzzle');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', checkCompletion);
        }

        updateUI();
    }

    /**
     * 캐비넷 퍼즐 초기화 (API 연동)
     */
    async initCabinetPuzzle() {
        const elementButtons = document.querySelectorAll('.element-btn');
        const feedback = document.getElementById('puzzleFeedback');
        
        if (!elementButtons.length || !feedback) {
            console.error("Cabinet puzzle elements not found");
            return;
        }

        elementButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const selectedElement = button.dataset.element;
                
                elementButtons.forEach(btn => {
                    btn.classList.remove('selected', 'wrong');
                });
                
                button.classList.add('selected');
                
                try {
                    const response = await gameAPI.submitPuzzleAnswer('cabinet-puzzle', selectedElement);
                    
                    if (response.success) {
                        feedback.textContent = `✅ ${response.message}`;
                        feedback.className = 'puzzle-feedback success';
                        
                        await this.completePuzzle('cabinet-puzzle');
                        
                        setTimeout(() => {
                            this.hide();
                            if (response.nextScene) {
                                this.handleNextScene(response.nextScene);
                            }
                        }, 2000);
                    } else {
                        button.classList.remove('selected');
                        button.classList.add('wrong');
                        
                        setTimeout(() => {
                            button.classList.remove('wrong');
                        }, 500);
                    }
                } catch (error) {
                    console.error('캐비넷 퍼즐 확인 실패:', error);
                    this.showError('퍼즐 확인 중 오류가 발생했습니다.');
                }
            });
        });
    }

    /**
     * 거울 퍼즐 초기화 (API 연동)
     */
    async initMirrorPuzzle() {
        const feedback = document.getElementById('puzzleFeedback');
        const codeInput = document.getElementById('mirrorCodeInput');
        const confirmBtn = document.getElementById('confirmMirrorPuzzle');
        
        if (!feedback || !codeInput || !confirmBtn) {
            console.error("Mirror puzzle elements not found");
            return;
        }

        codeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && codeInput.value.length === 4) {
                confirmBtn.click();
            }
        });

        confirmBtn.addEventListener('click', async () => {
            const userAnswer = codeInput.value.trim();
            
            if (userAnswer.length !== 4) {
                codeInput.classList.add('wrong');
                setTimeout(() => {
                    codeInput.classList.remove('wrong');
                }, 500);
                return;
            }
            
            try {
                const response = await gameAPI.submitPuzzleAnswer('mirror-puzzle', userAnswer);
                
                if (response.success) {
                    feedback.textContent = '🎉 STAGE1 실험실 CLEAR 🎉';
                    feedback.className = 'puzzle-feedback success show';
                    codeInput.disabled = true;
                    
                    await this.completePuzzle('mirror-puzzle');
                    
                    setTimeout(() => {
                        this.hide();
                        if (response.nextScene) {
                            this.handleNextScene(response.nextScene);
                        }
                    }, 1500);
                } else {
                    codeInput.classList.add('wrong');
                    codeInput.value = '';
                    codeInput.focus();
                    
                    setTimeout(() => {
                        codeInput.classList.remove('wrong');
                    }, 500);
                }
            } catch (error) {
                console.error('거울 퍼즐 확인 실패:', error);
                this.showError('퍼즐 확인 중 오류가 발생했습니다.');
            }
        });

        codeInput.focus();
    }

    /**
     * 잠긴 퍼즐 처리 (기존 로직 유지)
     */
    showLockedWithHandler(puzzleId) {
        // 기존 로직 유지
        import('../stage01/mirror.js').then(module => {
            if (puzzleId === 'mirror-puzzle') {
                module.handleMirror(this.modalTitle, this.puzzleContent, this.puzzleInput, this.submitBtn);
                this.puzzleModal.classList.add('show');
            }
        }).catch(error => {
            console.error('mirror.js import 실패:', error);
        });
        
        // 다른 퍼즐들도 유사하게 처리...
    }

    /**
     * 완료된 퍼즐 메시지 표시
     */
    showCompletedMessage(puzzle) {
        this.modalTitle.textContent = puzzle.title;
        this.puzzleContent.innerHTML = `<p style="color: #00ff00; font-weight: bold;">✅ 이미 완료된 퍼즐입니다.</p>`;
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
        const existingToast = document.querySelector('.notification-toast');
        if (existingToast) {
            existingToast.remove();
        }
    
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(toast);
    
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
    
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * 오류 메시지 표시
     */
    showError(message) {
        this.showNotification(`❌ ${message}`, 5000);
    }

    /**
     * 진행 상태 리셋
     */
    async resetProgress() {
        try {
            await gameAPI.resetProgress();
            await this.loadPlayerPuzzles();
            console.log('진행 상태가 리셋되었습니다.');
        } catch (error) {
            console.error('진행 상태 리셋 실패:', error);
            this.showError('진행 상태 리셋에 실패했습니다.');
        }
    }

    /**
     * 모든 퍼즐 잠금 해제
     */
    async unlockAll() {
        try {
            await gameAPI.unlockAll();
            await this.loadPlayerPuzzles();
            console.log('모든 퍼즐이 잠금 해제되었습니다.');
        } catch (error) {
            console.error('퍼즐 잠금 해제 실패:', error);
            this.showError('퍼즐 잠금 해제에 실패했습니다.');
        }
    }
}

export default new PuzzleManagerAPI();
