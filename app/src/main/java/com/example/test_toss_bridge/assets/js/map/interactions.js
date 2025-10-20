import puzzleManager from '../puzzles/puzzle-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('[data-puzzle]');

    interactiveElements.forEach(element => {
        // Ensure the listener is attached only to elements within the map container
        if (element.closest('.map-container')) {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const puzzleId = element.dataset.puzzle;
                const objectName = element.dataset.object;
                if (puzzleId) {
                    puzzleManager.show(puzzleId, objectName);
                }
            });
        }
    });
});
