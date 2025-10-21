export function handleCabinet(modalTitle, puzzleContent, puzzleInput, submitBtn) {
    modalTitle.textContent = '캐비넷';
    puzzleContent.innerHTML = `<p>잠겨있는 캐비넷이다. 무언가 특별한 방법으로 열어야 할 것 같다.</p><p class="locked-hint">다른 곳을 먼저 둘러보자.</p>`;
    puzzleInput.style.display = 'none';
    submitBtn.style.display = 'none';
}
