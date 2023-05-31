const socket = io();


//const terms = require("../global_terms/terms").terms;
//import { terms } from "../global_terms/terms";

width = 800;
height = 600;
const WINDOW_WIDTH = width;
const WINDOW_HIGHT = height;

//module.import.WINDOW_SIZE//; { WINDOW_SIZE } from "../global_terms/terms";
//const WINDOW_WIDTH = process.env.width;

const canvas = document.getElementById("canvas");
canvas.width = WINDOW_WIDTH;// WINDOW_SIZE.WINDOW_WIDTH;// WINDOW_WIDTH;
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