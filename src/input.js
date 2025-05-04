// input.js
export function initInput(canvas, keys) {
    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        keys.Space = true;
    }, { passive: false });
    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        keys.Space = false;
    }, { passive: false });
}

export function handleInput(worldState) {
    worldState.player.handleInput(worldState.keys);
}
