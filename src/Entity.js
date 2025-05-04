const {
    CANVAS_ID,
    GRAVITY,
    GROUND_LEVEL,
    DRAW_OFFSET_Y,
    CLIENT_SIZE,
    PLAYER_SIZE,
    SPRITE_PATHS
} = window.GameConstants; //require('./constants.js');

// Input State
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Entity Classes
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw(camX) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - camX, this.y, this.width, this.height);
    }
}

class ClientTrophy {
    constructor(x, y, assets) {
        this.x = x;
        this.y = y;
        this.collected = false;
        this.assets = assets;
    }
    update(player) {
        if (!this.collected &&
            player.x < this.x + CLIENT_SIZE.w &&
            player.x + PLAYER_SIZE.w > this.x &&
            player.y < this.y + CLIENT_SIZE.h &&
            player.y + PLAYER_SIZE.h > this.y) {
            this.collected = true;
            pickupSound.playbackRate = 2;  // half‐speed
            // pickupSound.currentTime = 0;     // rewind if you like
            pickupSound.play();
        }
    }
    draw(camX) {
        if (this.collected) return;
        ctx.drawImage(
            this.assets.client,
            this.x - camX - CLIENT_SIZE.w / 2,
            this.y,
            CLIENT_SIZE.w,
            CLIENT_SIZE.h
        );
    }
}

class Player {
    constructor(assets) {
        this.x = 50;
        this.y = GROUND_LEVEL - PLAYER_SIZE.h;
        this.vx = 0;
        this.vy = 0;
        this.jumping = false;
        this.speed = 6;
        this.assets = assets;
    }
    handleInput() {
        this.vx = keys.ArrowRight ? this.speed : keys.ArrowLeft ? -this.speed : 0;
        if (keys.Space && !this.jumping) {
            this.vy = -10;
            this.jumping = true;
        }
    }
    applyPhysics(platforms) {
        this.vy += GRAVITY;
        const nextY = this.y + this.vy;
        let landed = false;

        if (this.vy > 0) {
            for (const p of platforms) {
                const pTop = p.y;
                const overlapX = this.x + PLAYER_SIZE.w > p.x && this.x < p.x + p.width;
                const wasAbove = this.y + PLAYER_SIZE.h <= pTop;
                const willCross = nextY + PLAYER_SIZE.h >= pTop;
                if (overlapX && wasAbove && willCross) {
                    this.y = pTop - PLAYER_SIZE.h;
                    this.vy = 0;
                    landed = true;
                    break;
                }
            }
        }
        if (!landed) this.y += this.vy;

        // ground fallback
        if (this.y + PLAYER_SIZE.h > GROUND_LEVEL) {
            this.y = GROUND_LEVEL - PLAYER_SIZE.h;
            this.vy = 0;
            landed = true;
        }

        this.jumping = !landed;
    }
    clamp(bounds, camX) {
        this.x += this.vx;
        this.x = Math.max(bounds.minX(camX), Math.min(this.x, bounds.maxX()));
    }
    draw(camX) {
        const sprite = this.vx !== 0 ? this.assets.playerWalk : this.assets.playerStand;
        ctx.drawImage(
            sprite,
            this.x - camX,
            this.y + DRAW_OFFSET_Y,
            PLAYER_SIZE.w,
            PLAYER_SIZE.h
        );
    }
}

window.EntityClass = {
    ClientTrophy,
    Player,
    Platform
};
