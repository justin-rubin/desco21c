// src/loader.js
import { createReplayButton } from './ui.js';

/**
 * Loads all sprite assets, then creates the Replay button.
 *
 * @param {Object} SPRITE_PATHS            mapping of asset keys → URLs
 * @param {HTMLElement} gameContainer     the container to append the button into
 * @param {Function}    onReplay          callback to call when the user clicks “Replay”
 * @returns {Promise<Object>}             resolves with the { key: HTMLImageElement } map
 */
export function loadAssets(SPRITE_PATHS, gameContainer, onReplay) {
    const assets = {};
    const promises = [];

    for (const [key, src] of Object.entries(SPRITE_PATHS)) {
        const img = new Image();
        img.src = src;
        assets[key] = img;
        promises.push(
            new Promise((res, rej) => {
                img.onload = () => res(key);
                img.onerror = () => rej(new Error(`Failed to load ${src}`));
            })
        );
    }

    return Promise
        .all(promises)
        .then(() => {
            // All images are ready — now wire up the replay button
            createReplayButton(
                gameContainer,
                onReplay
            );
            return assets;
        });
}

// // loader.js
// export function loadAssets(SPRITE_PATHS) {
//     const assets = {};
//     const promises = [];
//     for (const [key, src] of Object.entries(SPRITE_PATHS)) {
//         const img = new Image();
//         img.src = src;
//         assets[key] = img;
//         promises.push(new Promise((res, rej) => {
//             img.onload = () => res(key);
//             img.onerror = () => rej(new Error(`Failed to load ${src}`));
//         }));
//     }
//     return Promise.all(promises).then(() => assets);
// }
