const drawPlayer = (context, player) => {
    const playerX = player.positionX;
    const playerY = player.positionY;

    context.beginPath();
    context.fillStyle = "rgb(255, 152, 8)";
    context.font = "30px sans-serif";
    context.textAlign = "center";
    context.fillText(`${player._name}`, playerX, playerY - 50);
    context.closePath();

    if(player._hot == false){
        context.beginPath();
        context.strokeStyle = "white";
        context.lineWidth = 10;
        context.arc(playerX, playerY, player._playerRadius, 0, Math.PI * 2);
        context.stroke();
        context.closePath();
    }else{
        //_hot
        context.beginPath();
        context.strokeStyle = "red";
        context.lineWidth = 10;
        context.arc(playerX, playerY, player._playerRadius, 0, Math.PI * 2);
        context.stroke();
        context.closePath();
    }
}