export function handleStorage(modalTitle, puzzleContent, puzzleInput, submitBtn) {
    modalTitle.textContent = '창고';
    puzzleContent.innerHTML = `<p>창고 문을 열었다. 다양한 실험 재료들이 보관되어 있다.</p><p class="locked-hint">다른 곳을 먼저 둘러보자.</p>`;
    puzzleInput.style.display = 'none';
    submitBtn.style.display = 'none';
}

