document.addEventListener('DOMContentLoaded', () => {
    const newsTicker = document.querySelector('.news-ticker');
    const summary = document.querySelector('.summary');
    const scene = document.querySelector('.scene');
    const introContent = document.querySelector('.intro-content');

    const newsText = "📰 속보: ‘갈륨(Ga)’ 성분이 금속 자물쇠를 녹이는 데 사용될 수 있다는 사실이 확인되었습니다.";
    const summaryText = "‘갈륨으론 자물쇠를 녹일 수 있다.’";

    function typeWriter(element, text, delay = 70, callback) {
        let i = 0;
        element.innerHTML = ''; // Clear element
        function typing() {
            if (i < text.length) {
                element.innerHTML = text.substring(0, i + 1) + '<span class="cursor">|</span>';
                i++;
                setTimeout(typing, delay);
            } else {
                element.innerHTML = text; // Remove cursor when done
                if (callback) {
                    setTimeout(callback, 500); // Wait a bit after typing
                }
            }
        }
        typing();
    }

    // Hide summary initially
    if (summary) {
        summary.style.display = 'none';
    }

    // Function to handle the transition to the map
    function proceedToMap() {
        // Prevent multiple clicks
        scene.removeEventListener('click', proceedToMap);

        const continuePrompt = document.querySelector('.continue-prompt');
        if (continuePrompt) {
            continuePrompt.style.display = 'none';
        }

        // Flicker and transition
        if (scene) {
            scene.classList.add('flicker-out');
        }
        setTimeout(() => {
            window.location.href = '../map/map01.html';
        }, 1000); // match flicker-out animation duration
    }

    // Start the intro sequence
    setTimeout(() => {
        if (newsTicker) {
            typeWriter(newsTicker, newsText, 70, () => {
                setTimeout(() => {
                    if (summary) {
                        newsTicker.style.display = 'none';
                        summary.style.display = 'block';
                        typeWriter(summary, summaryText, 100, () => {
                            // Typing finished, now wait for user interaction
                            const continuePrompt = document.createElement('p');
                            continuePrompt.className = 'continue-prompt';
                            continuePrompt.textContent = '화면을 클릭하여 계속하기';
                            continuePrompt.style.cssText = `
                                color: #fff;
                                margin-top: 30px;
                                font-weight: bold;
                                text-align: center;
                                opacity: 0;
                                animation: fadeIn 1s ease-in-out forwards;
                                animation-delay: 0.5s;
                            `;
                            introContent.appendChild(continuePrompt);

                            // Define fadeIn animation if it doesn't exist
                            const styleSheet = document.styleSheets[0];
                            const keyframes = `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
                            try {
                              styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
                            } catch(e) {
                              console.warn("Could not insert fadeIn rule, maybe it already exists.")
                            }

                            // Add click listener to the scene to proceed
                            scene.style.cursor = 'pointer';
                            scene.addEventListener('click', proceedToMap);
                        });
                    }
                }, 1000);
            });
        }
    }, 1000);
});
