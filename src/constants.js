// constants.js
export const constants = {
    CANVAS_ID: 'gameCanvas',
    GRAVITY: 0.5,
    GROUND_LEVEL: 350,
    DRAW_OFFSET_Y: 14,

    CLIENT_SIZE: {
        w: 40,
        h: 40
    },

    PLAYER_SIZE: {
        w: 30,
        h: 50
    },
    PLAYER_SPEED: {
        default: 6,
        mobileDefault: 3
    },
    SPEED_BOOST: 12,

    SPRITE_PATHS: {
        playerStand: 'assets/bill_stand.png',
        playerWalk: 'assets/bill_walk.png',
        client: 'assets/client.png',
        background: 'assets/background.png',
        badClient: 'assets/red_client_sprite.png',
        computerSpinning: 'assets/error_computer.png',
        coffeeMug: 'assets/coffee_mug.png',
        zombieWalk: 'assets/zombie_client_walk.png',
        zombieStand: 'assets/zombie_client_stand.png'
    }
};
