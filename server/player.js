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
        this._hot = false;
        this._space = false;
        //this._touch = false;
        this._block_side;
        this._visible = true;

        this.positionX = 50;//Math.floor(Math.random()* 1610);// (max - min) + min 300;
        this.positionY = 80;//Math.floor(Math.random()* 920);
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

        //if(!player._touch){
            if(move.left && player.positionX > 0 && player._block_side != "right" && player._block_side != "right-down" && player._block_side != "right-up"){
                player.positionX -= speed;
            }
            if(move.up && player.positionY > 0 && player._block_side != "down" && player._block_side != "left-down" && player._block_side != "right-down"){
                player.positionY -= speed;
            }
            if(move.right && player.positionX < WINDOW_WIDTH && player._block_side != "left" && player._block_side != "left-down" && player._block_side != "left-up"){
                player.positionX += speed;
            }
            if(move.down && player.positionY < WINDOW_HIGHT && player._block_side != "up" && player._block_side != "left-up" && player._block_side != "right-up"){
                player.positionY += speed;
            }
            player._space = move.space;
        //}

    })

    socket.on("disconnect", () => {
        delete players[socket.id];
    })
    return players;
}