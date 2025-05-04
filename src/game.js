import { constants } from "./constants.js";
import { styles } from "./styles.js";
import {
    Platform,
    Player,
    ClientTrophy
} from "./Entity.js";

const {
    CANVAS_ID,
    GROUND_LEVEL,
    CLIENT_SIZE,
    PLAYER_SIZE,
    SPRITE_PATHS,
    PLAYER_SPEED
} = constants;
const {
    HUD_FONT,
    HUD_COLOR,
    TITLE_FONT,
    TITLE_COLOR,
    SUBTITLE_FONT
} = styles;

// const {
//     CANVAS_ID,
//     GRAVITY,
//     GROUND_LEVEL,
//     DRAW_OFFSET_Y,
//     CLIENT_SIZE,
//     PLAYER_SIZE,
//     SPRITE_PATHS
// } = window.GameConstants; //require('./constants.js');

// const {
//     HUD_FONT,
//     HUD_COLOR,
//     TITLE_FONT,
//     TITLE_COLOR,
//     SUBTITLE_FONT
// } = window.GameStyles; //require('./styles.js');

// const {
//     ClientTrophy,
//     Player,
//     Platform
// } = window.EntityClass;

/* =======================
   Arcade Game (Refactored)
   ======================= */

const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
// Canvas & Context
const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext('2d');
// Game Container for dynamic UI
const gameContainer = document.getElementById('gameContainer');

canvas.addEventListener('touchstart', e => {
    e.preventDefault();            // prevent scrolling
    if (!player.jumping) {
        player.vy = -10;
        player.jumping = true;
    }
}, { passive: false });

// Control flags\ 
let gameRunning = false;
let frameId;

// Asset Loader
const assets = {};
function loadAssets() {
    const promises = [];
    for (const [key, src] of Object.entries(SPRITE_PATHS)) {
        const img = new Image();
        img.src = src;
        assets[key] = img;
        promises.push(new Promise(res => img.onload = res));
    }
    return Promise.all(promises);
}

// Sound Effects
const warnSound = new Audio('assets/Basso.mp3');

// Game Setup
const platforms = [
    new Platform(0, GROUND_LEVEL + 50, 2000, 50),
    new Platform(400, 270, 100, 10),
    new Platform(600, 220, 80, 10),
    new Platform(800, 180, 100, 10),
    new Platform(1100, 300, 250, 10)
];
const clients = [
    new ClientTrophy(300, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
    new ClientTrophy(850, 184 - CLIENT_SIZE.h, assets),
    new ClientTrophy(1300, 180 - CLIENT_SIZE.h, assets),
    new ClientTrophy(1500, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
    new ClientTrophy(1600, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
    new ClientTrophy(1700, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
    new ClientTrophy(1800, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
    new ClientTrophy(1900, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
    new ClientTrophy(2000, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
    new ClientTrophy(2100, GROUND_LEVEL - (CLIENT_SIZE.h / 2), assets),
];

// --- Mac Error hazard setup ---
const macErrors = [
    // position it where you like in level-coords:
    { x: 700, y: GROUND_LEVEL - PLAYER_SIZE.h, width: PLAYER_SIZE.w, height: PLAYER_SIZE.h, triggered: false },
    { x: 1000, y: GROUND_LEVEL - PLAYER_SIZE.h, width: PLAYER_SIZE.w, height: PLAYER_SIZE.h, triggered: false }
];

// 3×2 tiles are 32×32, so we’ll reuse CLIENT_SIZE for mug dimensions:
const SPEED_BOOST = 12;    // new max speed after drinking
const coffeeMugs = [
    {
        x: 1200,
        y: GROUND_LEVEL - CLIENT_SIZE.h,
        width: CLIENT_SIZE.w,
        height: CLIENT_SIZE.h,
        triggered: false
    }
];

let freezeActive = false;
let messageActive = false;

const player = new Player(assets);
let cameraX = 0;
let backgroundW = 0;
let milestoneHit = false;
const levelEndX = platforms[0].width - PLAYER_SIZE.w + 480;

// Bounds Helper
const bounds = {
    maxX: () => backgroundW * 2 - PLAYER_SIZE.w,
    minX: (camX) => Math.max(0, camX - 200)
};

// Create Replay button dynamically
let replayButton;
function createReplayButton() {
    replayButton = document.createElement('button');
    replayButton.textContent = 'Replay';
    Object.assign(replayButton.style, {
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
    gameContainer.appendChild(replayButton);
    replayButton.addEventListener('click', resetGame);
}

// Reset game state\ n
function resetGame() {
    // hide replay & show start
    gameRunning = false;
    if (frameId) cancelAnimationFrame(frameId);
    replayButton.style.display = 'none';
    document.getElementById('startScreen').style.display = '';
    // reset entities
    player.x = 50;
    player.y = GROUND_LEVEL - PLAYER_SIZE.h;
    player.vx = player.vy = 0;
    player.speed = isMobile ? PLAYER_SPEED.mobileDefault : PLAYER_SPEED.default;
    player.jumping = false;
    cameraX = 0;
    milestoneHit = freezeActive = messageActive = false;
    clients.forEach(c => c.collected = false);
    coffeeMugs.forEach(cm => cm.triggered = false);
    macErrors.forEach(m => m.triggered = false);
    // zombies.forEach(z => { z.x = z.zone.minX; z.dir = 1; });
}

// Update & Draw
function update() {
    if (milestoneHit) {
        // zero out any motion
        player.vx = 0;
        player.vy = 0;
        player.speed = isMobile ? PLAYER_SPEED.mobileDefault : PLAYER_SPEED.default;
        // skip all input/physics/camera updates
        return;
    }
    // 2. ——— coffee boost ———
    for (const cm of coffeeMugs) {
        if (!cm.triggered &&
            player.x < cm.x + cm.width &&
            player.x + PLAYER_SIZE.w > cm.x &&
            player.y < cm.y + cm.height &&
            player.y + PLAYER_SIZE.h > cm.y) {
            cm.triggered = true;
            player.speed = SPEED_BOOST;  // Bill moves faster
            setTimeout(() => {
                player.speed = isMobile ? PLAYER_SPEED.mobileDefault : PLAYER_SPEED.default;
            }, 3000);
            break;
        }
    }

    // 2. check for computer collision
    if (!freezeActive) {
        for (const m of macErrors) {
            if (!m.triggered &&
                player.x < m.x + m.width &&
                player.x + PLAYER_SIZE.w > m.x &&
                player.y < m.y + m.height &&
                player.y + PLAYER_SIZE.h > m.y) {

                m.triggered = true;     // so it won’t draw again
                freezeActive = true;     // pause Bill
                messageActive = true;
                player.vx = player.vy = 0;
                warnSound.play();

                setTimeout(() => {
                    freezeActive = false;   // unfreeze after 3s
                    messageActive = false;
                }, 3000);

                break;
            }
        }
    }

    // 2. only do the normal movement when not frozen
    if (!freezeActive) {
        player.handleInput();
        player.applyPhysics(platforms);
        player.clamp(bounds, cameraX);
        clients.forEach(c => c.update(player));
    } else {
        // keep him locked in place while hazard freezeActive
        player.vx = player.vy = 0;
    }

    // ——— 3) Camera follow ———
    cameraX = Math.max(
        0,
        Math.min(player.x - 100, backgroundW * 2 - canvas.width)
    );

    // ——— 4) Level-end check ———
    if (!milestoneHit && player.x >= levelEndX) {
        milestoneHit = true;
        // show replay button
        if (replayButton) {
            replayButton.style.display = 'block';
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    const bgX = -cameraX * 0.5;
    ctx.drawImage(assets.background, bgX, 0, backgroundW, canvas.height);
    ctx.drawImage(assets.background, bgX + backgroundW, 0, backgroundW, canvas.height);

    // platforms
    platforms.forEach(p => p.draw(cameraX, ctx));

    // player
    player.draw(cameraX, ctx);

    // clients
    clients.forEach(c => c.draw(cameraX, ctx));

    // draw the computer spinning sprite only if not yet hit
    macErrors.forEach(m => {
        if (!m.triggered) {
            ctx.drawImage(
                assets.computerSpinning,
                m.x - cameraX,
                m.y,
                m.width,
                m.height
            );
        }
    });

    // draw coffee mugs
    coffeeMugs.forEach(cm => {
        if (!cm.triggered) {
            ctx.drawImage(
                assets.coffeeMug,
                cm.x - cameraX,
                cm.y,
                cm.width,
                cm.height
            );
        }
    });

    // HUD
    ctx.fillStyle = HUD_COLOR;
    ctx.font = HUD_FONT;
    const score = clients.filter(c => c.collected).length;
    ctx.fillText(`Clients: ${score}/${clients.length}`, 10, 20);

    // milestone overlay
    if (milestoneHit) {
        ctx.save();
        ctx.fillStyle = TITLE_COLOR;
        ctx.textAlign = 'center';
        ctx.font = TITLE_FONT;
        ctx.fillText('Milestone Complete!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = SUBTITLE_FONT;
        ctx.fillText(`Clients collected: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.restore();
    }

    // finally, if messageActive, overlay “Mac Error”
    if (messageActive) {
        ctx.save();
        ctx.fillStyle = TITLE_COLOR;     // e.g. '#FFD700'
        ctx.textAlign = 'center';
        ctx.font = TITLE_FONT;      // e.g. '48px sans-serif'
        ctx.fillText('Mac Error!', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}

// Main Loop
function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    // requestAnimationFrame(gameLoop);
    frameId = requestAnimationFrame(gameLoop);
}

// Start Game
loadAssets().then(() => {
    backgroundW = assets.background.width;
    createReplayButton();
    document.getElementById('startButton').onclick = () => {
        document.getElementById('startScreen').style.display = 'none';
        //resetGame();
        gameRunning = true;
        gameLoop();
        frameId = requestAnimationFrame(gameLoop);
    };
});
