/**
 * 게임 API 클라이언트 (하이브리드 모드)
 * 안드로이드 앱 환경에서는 ApiBridge를, 웹 환경에서는 fetch를 사용하여 통신합니다.
 */
class GameAPI {
    constructor() {
        // `window.Android`의 존재 여부로 네이티브 브릿지 사용 가능 여부를 판단합니다.
        this.useBridge = typeof window.Android !== 'undefined';
        this.isNewPlayer = !localStorage.getItem('playerId');
        this.playerId = this.generatePlayerId();

        console.log(`API 클라이언트 초기화. 브릿지 사용: ${this.useBridge}`);
        if (this.isNewPlayer) {
            console.log("새로운 플레이어 세션이 시작되었습니다.");
        }
    }

    /**
     * 플레이어 ID를 생성하거나 localStorage에서 불러옵니다.
     */
    generatePlayerId() {
        let playerId = localStorage.getItem('playerId');
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('playerId', playerId);
        }
        return playerId;
    }

    /**
     * API 요청을 처리하는 중앙 함수입니다.
     * @param {string} methodName - 호출할 ApiBridge의 메소드 이름
     * @param {object} fetchOptions - fetch를 위한 옵션 (url, method, body)
     * @param {...any} bridgeArgs - ApiBridge 메소드에 전달할 인자들
     */
    async request(methodName, fetchOptions, ...bridgeArgs) {
        if (this.useBridge) {
            // --- 안드로이드 ApiBridge 사용 --- 
            return new Promise((resolve, reject) => {
                if (typeof window.Android[methodName] !== 'function') {
                    return reject(new Error(`ApiBridge에 ${methodName} 메소드가 존재하지 않습니다.`));
                }

                // 고유한 콜백 함수 이름 생성
                const callbackName = `__native_callback_${methodName}_${Date.now()}`;

                // 결과 처리를 위한 전역 콜백 함수 정의
                window[callbackName] = (result, error) => {
                    if (error) {
                        console.error(`ApiBridge Error (${methodName}):`, error);
                        try {
                            reject(JSON.parse(error)); // 에러가 JSON 문자열일 경우 파싱
                        } catch (e) {
                            reject(error);
                        }
                    } else {
                        resolve(result);
                    }
                    // 메모리 누수 방지를 위해 사용한 콜백 함수 삭제
                    delete window[callbackName];
                };

                // 네이티브 메소드 호출 (객체 인자는 JSON 문자열로 변환)
                try {
                    const finalArgs = bridgeArgs.map(arg => 
                        (typeof arg === 'object' && arg !== null) ? JSON.stringify(arg) : arg
                    );
                    window.Android[methodName](...finalArgs, callbackName);
                } catch (e) {
                    console.error(`ApiBridge 호출 중 에러 발생 (${methodName}):`, e);
                    reject(e);
                    delete window[callbackName];
                }
            });
        } else {
            // --- 웹 환경 fetch 사용 --- 
            const options = {
                headers: { 'Content-Type': 'application/json' },
                ...fetchOptions
            };
            if (options.body) {
                options.body = JSON.stringify(options.body);
            }

            try {
                const response = await fetch("http://localhost:8080/api" + fetchOptions.url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('API 요청 실패:', error);
                throw error;
            }
        }
    }

    // --- Controller의 각 API를 호출하는 메소드들 ---

    async getPlayerPuzzles() {
        if (this.isNewPlayer) {
            await this.resetProgress();
            this.isNewPlayer = false; 
        }
        // ApiBridge에는 getPlayerPuzzles가 없으므로 getProgress로 대체
        return this.request('getProgress', { url: `/game/progress/${this.playerId}` }, this.playerId);
    }
    
    async submitPuzzleAnswer(puzzleId, answer) {
        const body = { playerId: this.playerId, puzzleId, answer };
        // ApiBridge에는 submitPuzzleAnswer가 없으므로 ApiService에 정의된 것을 호출한다고 가정
        return this.request('submitPuzzleAnswer', { url: '/puzzle/submit', method: 'POST', body }, body);
    }

    async completePuzzle(puzzleId) {
        const params = new URLSearchParams({ playerId: this.playerId, puzzleId });
        return this.request('completePuzzle', { url: `/game/complete-puzzle?${params}`, method: 'POST' }, this.playerId, puzzleId);
    }

    async resetProgress() {
        return this.request('resetProgress', { url: `/game/reset/${this.playerId}`, method: 'POST' }, this.playerId);
    }

    async unlockAll() {
        return this.request('unlockAll', { url: `/game/unlock-all/${this.playerId}`, method: 'POST' }, this.playerId);
    }

    async getPuzzleStatus(puzzleId) {
        return this.request('getPuzzleStatus', { url: `/game/puzzle-status/${this.playerId}/${puzzleId}` }, this.playerId, puzzleId);
    }

    async getGameInfo() {
        return this.request('getGameInfo', { url: '/game/info' });
    }

    // --- 기존 유틸리티 메소드들 ---

    getPlayerId() {
        return this.playerId;
    }

    resetPlayerId() {
        localStorage.removeItem('playerId');
        this.playerId = this.generatePlayerId();
        return this.playerId;
    }
}

// 전역 인스턴스 생성
window.gameAPI = new GameAPI();
