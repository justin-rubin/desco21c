// entities.js
import { constants } from './constants.js';
import { Platform, Player, ClientTrophy, Coffee, MacError, Zombie } from './Entity.js';

export const worldState = {
    assets: null, canvas: null, ctx: null,
    keys: {}, gameRunning: false, frameId: null,
    platforms: [], clients: [], coffeeMugs: [], macErrors: [], zombies: [], player: null,
    cameraX: 0, backgroundW: 0, milestoneHit: false,
    freezeActive: false, messageActive: false, levelEndX: 0,
    HUD_FONT: constants.HUD_FONT, HUD_COLOR: constants.HUD_COLOR,
    TITLE_FONT: constants.TITLE_FONT, TITLE_COLOR: constants.TITLE_COLOR,
    SUBTITLE_FONT: constants.SUBTITLE_FONT,
    onLevelComplete: () => worldState.replayBtn.style.display = 'block',
    resetEntities: null
};

export function initEntities(state) {
    const { GROUND_LEVEL, CLIENT_SIZE, PLAYER_SIZE, SPRITE_PATHS } = constants;
    const assets = state.assets;

    const groundBufferClient = CLIENT_SIZE.h / 2;
    const groundBufferPlayer = PLAYER_SIZE.h / 2;

    const entities = {};

    entities.platforms = [
        new Platform(0, GROUND_LEVEL + 50, 2000, 50),
        new Platform(400, 270, 100, 10),
        new Platform(600, 220, 80, 10),
        new Platform(800, 180, 100, 10),
        new Platform(1100, 300, 250, 10)
    ];
    entities.clients = [
        new ClientTrophy(300, GROUND_LEVEL - groundBufferClient, assets),
        new ClientTrophy(850, 184 - CLIENT_SIZE.h, assets),
        new ClientTrophy(1300, 180 - CLIENT_SIZE.h, assets),
        new ClientTrophy(1500, GROUND_LEVEL - groundBufferClient, assets),
        new ClientTrophy(1600, GROUND_LEVEL - groundBufferClient, assets),
        new ClientTrophy(1700, GROUND_LEVEL - groundBufferClient, assets),
        new ClientTrophy(1800, GROUND_LEVEL - groundBufferClient, assets),
        new ClientTrophy(1900, GROUND_LEVEL - groundBufferClient, assets),
        new ClientTrophy(2000, GROUND_LEVEL - groundBufferClient, assets),
        new ClientTrophy(2100, GROUND_LEVEL - groundBufferClient, assets),
    ];
    entities.coffeeMugs = [
        new Coffee(1200, GROUND_LEVEL - CLIENT_SIZE.h, assets)
    ];
    entities.macErrors = [
        new MacError(700, GROUND_LEVEL - groundBufferPlayer, assets),
        new MacError(1000, GROUND_LEVEL - groundBufferPlayer, assets)
    ];
    // state.zombies = [new Zombie(500, GROUND_LEVEL - PLAYER_SIZE.h, { minX: 400, maxX: 800 }, state.assets)];
    entities.player = new Player(assets);
    state.entities = entities;

    state.levelEndX = entities.platforms[0].width - PLAYER_SIZE.w + 480;
    state.resetEntities = () => initEntities(state);
}