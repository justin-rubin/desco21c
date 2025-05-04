// src/ui.js

/**
 * Creates a Replay button in the given container and sets up its click handler.
 * @param {HTMLElement} container - The DOM element to attach the button to.
 * @param {Function} onReplay - Callback to invoke when the user clicks "Replay".
 * @returns {HTMLButtonElement}
 */
export function createReplayButton(container, onReplay) {
    const btn = document.createElement('button');
    btn.textContent = 'Replay';
    Object.assign(btn.style, {
        position: 'absolute',
        top: '67%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '12px 24px',
        fontSize: '18px',
        background: '#8f8',
        display: 'none',
        zIndex: 20
    });
    container.appendChild(btn);
    btn.addEventListener('click', () => onReplay());
    return btn;
}

/**
 * Resets game state and optionally shows the start screen.
 * @param {Object} worldState - The central game state object.
 * @param {boolean} [showSplash=true] - Whether to show the splash/start screen.
 */
export function resetGame(worldState, showSplash = true) {
    // Stop the game loop
    worldState.gameRunning = false;
    if (worldState.frameId) cancelAnimationFrame(worldState.frameId);

    // Reset all entities and flags
    worldState.resetEntities();

    // Show or hide UI screens
    if (showSplash) {
        document.getElementById('startScreen').style.display = '';
        document.getElementById('gameContainer').style.display = 'none';
    }
}
