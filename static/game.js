const socket = io();

width = 800;
height = 600;
const WINDOW_WIDTH = width;
const WINDOW_HIGHT = height;

const canvas = document.getElementById("canvas");
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HIGHT;
const context = canvas.getContext("2d");

socket.emit("new player");

socket.on("state", (players) => {
    context.beginPath();
    context.fillStyle = "black";
    context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HIGHT);
    context.closePath();
    for (const id in players) {
        const player = players[id];
        drawPlayer(context, player);
    }
});