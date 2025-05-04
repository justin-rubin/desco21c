// draw.js
export function drawGame(ctx, worldState) {
    const { canvas, backgroundW, assets, platforms, clients, coffeeMugs, macErrors, zombies, player, HUD_FONT, HUD_COLOR, TITLE_FONT, TITLE_COLOR, SUBTITLE_FONT } = worldState;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background
    const bgX = -worldState.cameraX * 0.5;
    ctx.drawImage(assets.background, bgX, 0, backgroundW, canvas.height);
    ctx.drawImage(assets.background, bgX + backgroundW, 0, backgroundW, canvas.height);
    // platforms
    platforms.forEach(p => p.draw(ctx, worldState.cameraX));
    // clients
    clients.forEach(c => c.draw(ctx, worldState.cameraX));
    // items & hazards
    coffeeMugs.forEach(cm => cm.draw(ctx, worldState.cameraX));
    macErrors.forEach(m => m.draw(ctx, worldState.cameraX));
    zombies.forEach(z => z.draw(ctx, worldState.cameraX));
    // player
    player.draw(ctx, worldState.cameraX);
    // HUD
    ctx.fillStyle = HUD_COLOR; ctx.font = HUD_FONT;
    const score = clients.filter(c => c.collected).length;
    ctx.fillText(`Clients: ${score}/${clients.length}`, 10, 20);
    // overlays
    if (worldState.milestoneHit) {
        ctx.save(); ctx.fillStyle = TITLE_COLOR; ctx.textAlign = 'center'; ctx.font = TITLE_FONT;
        ctx.fillText('Milestone Complete!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = SUBTITLE_FONT;
        ctx.fillText(`Clients: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.restore();
    }
    if (worldState.messageActive) {
        ctx.save(); ctx.fillStyle = TITLE_COLOR; ctx.textAlign = 'center'; ctx.font = TITLE_FONT;
        ctx.fillText('Mac Error!', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}
