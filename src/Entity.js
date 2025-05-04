import { constants } from "./constants.js";

const {
    GRAVITY,
    GROUND_LEVEL,
    DRAW_OFFSET_Y,
    CLIENT_SIZE,
    PLAYER_SIZE,
    PLAYER_SPEED
} = constants;

const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
// Sound Effects
const pickupSound = new Audio('assets/mario-coin.mp3');

// Input State
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Entity Classes
export class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw(ctx, camX) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - camX, this.y, this.width, this.height);
    }
}

export class ClientTrophy {
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
    draw(ctx, camX) {
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

export class Player {
    constructor(assets) {
        this.x = 50;
        this.y = GROUND_LEVEL - PLAYER_SIZE.h;
        this.vx = 0;
        this.vy = 0;
        this.jumping = false;
        this.speed = isMobile ? PLAYER_SPEED.mobileDefault : PLAYER_SPEED.default;
        this.assets = assets;
    }
    handleInput() {
        // this.vx = keys.ArrowRight ? this.speed : keys.ArrowLeft ? -this.speed : 0;
        const s = this.speed || PLAYER_SPEED.default;
        if (isMobile) {
            // always move right on mobile
            this.vx = this.speed || PLAYER_SPEED.mobileDefault;
        } else {
            // normal desktop/keyboard
            this.vx = keys.ArrowRight ? s
                : keys.ArrowLeft ? -s
                    : 0;
        }
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
    draw(ctx, camX) {
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

/**
 * Coffee power-up: boosts player speed for a duration when touched.
 */
export class Coffee {
    constructor(x, y, assets, speedBoost = 12, duration = 3000) {
        this.x = x;
        this.y = y;
        this.width = CLIENT_SIZE.w;
        this.height = CLIENT_SIZE.h;
        this.triggered = false;
        this.assets = assets;
        this.speedBoost = speedBoost;
        this.duration = duration;
    }

    update(player) {
        if (!this.triggered &&
            player.x < this.x + this.width &&
            player.x + PLAYER_SIZE.w > this.x &&
            player.y < this.y + this.height &&
            player.y + PLAYER_SIZE.h > this.y) {
            this.triggered = true;
            const originalSpeed = player.speed;
            player.speed = this.speedBoost;
            setTimeout(() => {
                player.speed = originalSpeed;
            }, this.duration);
        }
    }

    draw(ctx, camX) {
        if (this.triggered) return;
        ctx.drawImage(
            this.assets.coffeeMug,
            this.x - camX,
            this.y,
            this.width,
            this.height
        );
    }
}

/**
 * MacError hazard: freezes player and displays message when touched.
 */
export class MacError {
    constructor(x, y, assets, freezeTime = 3000) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_SIZE.w;
        this.height = PLAYER_SIZE.h;
        this.triggered = false;
        this.assets = assets;
        this.freezeTime = freezeTime;
    }

    update(player, worldState) {
        if (!this.triggered &&
            player.x < this.x + this.width &&
            player.x + PLAYER_SIZE.w > this.x &&
            player.y < this.y + this.height &&
            player.y + PLAYER_SIZE.h > this.y) {
            this.triggered = true;
            worldState.freezeActive = true;
            worldState.messageActive = true;
            player.vx = player.vy = 0;
            this.assets.warnSound.play().catch(() => { });
            setTimeout(() => {
                worldState.freezeActive = false;
                worldState.messageActive = false;
            }, this.freezeTime);
        }
    }

    draw(ctx, camX) {
        if (this.triggered) return;
        ctx.drawImage(
            this.assets.computerSpinning,
            this.x - camX,
            this.y,
            this.width,
            this.height
        );
    }
}

/**
 * Zombie enemy: patrols between zone.minX and zone.maxX, resets game on contact.
 */
export class Zombie {
    constructor(x, y, zone, assets, speed = 1.5) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_SIZE.w;
        this.height = PLAYER_SIZE.h;
        this.zone = zone;      // { minX, maxX }
        this.dir = 1;
        this.speed = speed;
        this.assets = assets;
    }

    update(player) {
        // patrol motion
        this.x += this.speed * this.dir;
        if (this.x < this.zone.minX || this.x > this.zone.maxX) {
            this.dir *= -1;
            this.x = Math.max(this.zone.minX, Math.min(this.x, this.zone.maxX));
        }
        // collision resets page
        if (
            player.x < this.x + this.width &&
            player.x + PLAYER_SIZE.w > this.x &&
            player.y < this.y + this.height &&
            player.y + PLAYER_SIZE.h > this.y) {
            window.location.reload();
        }
    }

    draw(ctx, camX) {
        ctx.drawImage(
            this.assets.zombieClient,
            this.x - camX,
            this.y,
            this.width,
            this.height
        );
    }
}