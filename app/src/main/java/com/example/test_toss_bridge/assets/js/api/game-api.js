/**
 * 게임 API 클라이언트
 * 백엔드 스프링부트 서버와 통신하는 모듈
 */

class GameAPI {
    constructor(baseURL = 'http://localhost:8080/api') {
        this.baseURL = baseURL;
        this.playerId = this.generatePlayerId();
    }

    /**
     * 플레이어 ID 생성 (브라우저 기반)
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
     * HTTP 요청 헬퍼
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
        }
    }

    /**
     * 모든 퍼즐 정보 조회
     */
    async getAllPuzzles() {
        return await this.request('/puzzle/all');
    }

    /**
     * 플레이어별 퍼즐 상태 조회
     */
    async getPlayerPuzzles() {
        return await this.request(`/puzzle/player/${this.playerId}`);
    }

    /**
     * 특정 퍼즐 정보 조회
     */
    async getPuzzle(puzzleId) {
        return await this.request(`/puzzle/${puzzleId}`);
    }

    /**
     * 퍼즐 정답 제출
     */
    async submitPuzzleAnswer(puzzleId, answer) {
        const requestBody = {
            playerId: this.playerId,
            puzzleId: puzzleId,
            answer: answer
        };

        return await this.request('/puzzle/submit', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
    }

    /**
     * 퍼즐 상태 확인 (잠금/완료)
     */
    async getPuzzleStatus(puzzleId) {
        return await this.request(`/puzzle/status/${this.playerId}/${puzzleId}`);
    }

    /**
     * 게임 진행 상태 조회
     */
    async getGameProgress() {
        return await this.request(`/game/progress/${this.playerId}`);
    }

    /**
     * 게임 진행 상태 저장
     */
    async saveGameProgress(progress) {
        return await this.request('/game/progress', {
            method: 'POST',
            body: JSON.stringify(progress)
        });
    }

    /**
     * 퍼즐 완료 처리
     */
    async completePuzzle(puzzleId) {
        return await this.request(`/game/complete-puzzle?playerId=${this.playerId}&puzzleId=${puzzleId}`, {
            method: 'POST'
        });
    }

    /**
     * 게임 진행 상태 리셋
     */
    async resetProgress() {
        return await this.request(`/game/reset/${this.playerId}`, {
            method: 'POST'
        });
    }

    /**
     * 모든 퍼즐 잠금 해제 (개발용)
     */
    async unlockAll() {
        return await this.request(`/game/unlock-all/${this.playerId}`, {
            method: 'POST'
        });
    }

    /**
     * 게임 정보 조회
     */
    async getGameInfo() {
        return await this.request('/game/info');
    }

    /**
     * 퍼즐 순서 조회
     */
    async getPuzzleOrder() {
        return await this.request('/puzzle/order');
    }

    /**
     * 플레이어 ID 조회
     */
    getPlayerId() {
        return this.playerId;
    }

    /**
     * 플레이어 ID 재설정
     */
    resetPlayerId() {
        localStorage.removeItem('playerId');
        this.playerId = this.generatePlayerId();
        return this.playerId;
    }
}

// 전역 인스턴스 생성
window.gameAPI = new GameAPI();
