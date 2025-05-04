// game.js
// Entry point for the arcade game, orchestrating asset loading, input, update, draw, and UI.

import { constants } from './constants.js';
import { styles } from './styles.js';
import { loadAssets } from './loader.js';
import { initInput, handleInput } from './input.js';
import { updateGame } from './update.js';
import { drawGame } from './draw.js';
import { createReplayButton, resetGame } from './ui.js';
import { initEntities, worldState } from './entities.js';

const { CANVAS_ID } = constants;
const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext('2d');
let frameId;

const startBtn = document.getElementById('startButton');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');

// when you build the button, pass in the real reset logic:
const replayBtn = createReplayButton(gameContainer, () => {
    // 1) stop the old loop
    cancelAnimationFrame(frameId);
    worldState.gameRunning = false;

    // 2) reset everything *and* show the start splash
    resetGame(worldState);              // your ui.js function
    startScreen.style.display = '';   // re-show PLAY screen
    gameContainer.style.display = 'none';
});

// startBtn.addEventListener('click', () => {
//     startScreen.style.display = 'none';
//     gameContainer.style.display = 'block';
//     worldState.resetEntities();       // clear positions, flags, etc.
//     worldState.gameRunning = true;
//     frameId = requestAnimationFrame(loop);
// });

// REPLAY handler:
// replayBtn.onclick = () => resetGame(true);

// Main game loop
function loop() {
    if (!worldState.gameRunning) return;
    handleInput(worldState);
    updateGame(worldState);
    drawGame(ctx, worldState);
    frameId = requestAnimationFrame(loop);
}

// Start sequence: load assets, initialize, then begin loop
// loadAssets(constants.SPRITE_PATHS)
//     .then(assets => {
//         worldState.assets = assets;
//         worldState.canvas = canvas;
//         worldState.ctx = ctx;
//         initEntities(worldState);

//         // set up controls and UI
//         initInput(canvas);
//         // replayBtn();
//         // createReplayButton(document.getElementById('gameContainer'), () => {
//         //     cancelAnimationFrame(frameId);
//         //     resetGame(worldState);
//         //     frameId = requestAnimationFrame(loop);
//         // });

//         // start button
//         document.getElementById('startButton').onclick = () => {
//             resetGame(worldState);
//             worldState.gameRunning = true;
//             frameId = requestAnimationFrame(loop);
//         };
//     })
//     .catch(err => console.error('Asset loading failed:', err));

loadAssets(constants.SPRITE_PATHS, gameContainer, () => {
    // This is your “Replay” handler:
    worldState.gameRunning = false;

    // worldState.resetEntities();
    document.getElementById('startScreen').style.display = '';
    gameContainer.style.display = 'none';
})
    .then(assets => {
        worldState.assets = assets;
        worldState.canvas = canvas;
        worldState.ctx = ctx;
        initEntities(worldState);

        startButton.addEventListener('click', () => {
            document.getElementById('startScreen').style.display = 'none';
            gameContainer.style.display = 'block';
            worldState.resetEntities();
            worldState.gameRunning = true;
            requestAnimationFrame(loop);
        });
    })
    .catch(err => console.error('Asset loading failed:', err));