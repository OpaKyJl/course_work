const players = {};
 
//const WINDOW_WIDTH = require("../static/game").WINDOW_WIDTH;
//const WINDOW_HIGHT = require("../static/game").WINDOW_HIGHT;
//import { WINDOW_WIDTH } from "../static/game";
width = 1920 - 300 - 10;//1600;
height = 1080 - 150 - 10;
const WINDOW_WIDTH = width;
const WINDOW_HIGHT = height;

class Player {
    constructor(props){
        this._name = props.name;
        this._id = props.id;
        this._playerRadius = 30;

        this.positionX = 300;
        this.positionY = 300;
    }
}

module.exports.getPlayers = (socket) => {
    socket.on("new player", (_name) => {
        players[socket.id] = new Player({
            id: socket.id,
            name: _name,//Object.keys(players).length,//prompt("Введите имя", "Игрок"),//Object.keys(players).length,
        });
    });

    socket.on("movement", (move) => {//получим результаты из move.js
        const player = players[socket.id] || {};
        const speed = 10;
        if(move.left && player.positionX > 0){
            player.positionX -= speed;
        }
        if(move.up && player.positionY > 0){
            player.positionY -= speed;
        }
        if(move.right && player.positionX < WINDOW_WIDTH){
            player.positionX += speed;
        }
        if(move.down && player.positionY < WINDOW_HIGHT){
            player.positionY += speed;
        }
    })

    socket.on("disconnect", () => {
        delete players[socket.id];
    })
    return players;
}