const drawPlayer = (context, player) => {
    const playerX = player.positionX;
    const playerY = player.positionY;

    context.beginPath();
    context.fillStyle = "black";
    context.font = "20px sans-serif";
    context.textAlign = "center";
    context.fillText(`${player._name}`, playerX, playerY - 50);
    context.closePath();

    context.beginPath();
    context.strokeStyle = "white";
    context.lineWidth = 10;
    context.arc(playerX, playerY, player._playerRadius, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
}