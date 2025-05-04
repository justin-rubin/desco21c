// update.js
export function updateGame(worldState) {
    const { player, platforms, clients, coffeeMugs, macErrors, bounds, cameraX, levelEndX } = worldState;
    if (worldState.milestoneHit) {
        player.vx = player.vy = 0;
        return;
    }
    // coffee boost
    coffeeMugs.forEach(cm => cm.update(player, worldState));

    // mac error freeze
    macErrors.forEach(m => m.update(player, worldState));

    if (!worldState.freezeActive) {
        player.applyPhysics(platforms);
        clients.forEach(c => c.update(player));
    }

    worldState.cameraX = Math.max(0, Math.min(player.x - 100, worldState.backgroundW * 2 - worldState.canvas.width));

    if (!worldState.milestoneHit && player.x >= levelEndX) {
        worldState.milestoneHit = true;
        worldState.onLevelComplete();
    }
}
