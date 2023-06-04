//const { count } = require("console");
const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const getPlayers = require("./player").getPlayers;

const app = express();
const server = http.Server(app);
const io = socketIO(server);


app.set("port", 5000);

app.use("/static", express.static(path.dirname(__dirname) + "/static"));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "index.html"));
});

var array_blocks = [];

server.listen(5000, () => {
    console.log("Starting server on port 5000");

    width = 1610;//1920 - 300 - 10;//1600;
    height = 920//1080 - 150 - 10;//800;
    const WINDOW_WIDTH = width;
    const WINDOW_HIGHT = height;
    
    //рисуем препятствия (при запуске сервера)
    //var array_blocks = ["x0", "y0", "x1", "y1"];

    for(i=0; i < 10; i++){
        let x0 = Math.floor(Math.random()* (WINDOW_WIDTH - 60));
        let y0 = Math.floor(Math.random()* (WINDOW_HIGHT - 60));
        let sizex = Math.floor(Math.random()* (100 - 20) + 20);
        let sizey = Math.floor(Math.random()* (100 - 20) + 20);
        let x1 = sizex;
        let y1 = sizey;
    
           array_blocks.push([x0, y0, x1, y1]);
    }

    //io.sockets.emit("drawedBlocks_for_player", array_blocks);
    module.exports.array_blocks = () =>{
        return array_blocks;
    };
    array = array_blocks;

    setInterval(() => {
        io.sockets.emit("drawedBlocks", array);
    }, 1000 )

});

let players = null;
io.on("connection", (socket) => {
    players = getPlayers(socket);

    //начинается таймер при нажатии на кнопку
    socket.on("start_game", (count) => {
        io.sockets.emit("timer_started");
        const intervalId = setInterval(() => {
            io.sockets.emit("timer", count);
            if(count>0) count--;
            else {
                clearInterval(intervalId);//когда таймер закончится, перестать его выполнять
                io.sockets.emit("timer_stoped");
            }
        }, 1000)
    })
    
});


function hot(player_hot, player_cold){
    player_hot._hot = true;
    player_cold._hot = false;
}

//var crush = true;
const gameLoop = (players, io) => {

    let array_id = [];
        let i = 0;
        for (const id in players) {
            array_id[i] = id;
            i++;
        }
    //array_blocks;

    //у плеера добавить проверку соприкосновения с блоком
    
    for (const id in players) {
        const player = players[id];
        var touch = 0;

        //сделать чтоб понятно, с какой стороны препятствие
        var block_side = "";
        for(i=0; i < (array_blocks.length); i++){
            if(
                (player.positionX > (array_blocks[i][0] + array_blocks[i][2] + 30) || player.positionX < (array_blocks[i][0] - 30))//x1 и y2 это размерность, а не вторые координаты!!!
                ||
                (player.positionY > (array_blocks[i][1] + array_blocks[i][3] + 30) || player.positionY < (array_blocks[i][1] - 30))
            ){
            }else{
                if((player.positionX > (array_blocks[i][0] + array_blocks[i][2]))) block_side = "right";
                if((player.positionX < (array_blocks[i][0]))) block_side = "left";
                if((player.positionY > (array_blocks[i][1] + array_blocks[i][3]))) block_side = "down";
                if((player.positionY < (array_blocks[i][1]))) block_side = "up";
            }
        }
        for(i=0; i < (array_blocks.length); i++){
            if(
                (player.positionX > (array_blocks[i][0] + array_blocks[i][2] + 30) || player.positionX < (array_blocks[i][0] - 30))//x1 и y2 это размерность, а не вторые координаты!!!
                ||
                (player.positionY > (array_blocks[i][1] + array_blocks[i][3] + 30) || player.positionY < (array_blocks[i][1] - 30))
            ){

            }else{
                touch++;
            }
        }
        if(touch != 0){
            player._touch = true;
        }else{
            player._touch = false;
        } 
        console.log(array_blocks);
        console.log(player._touch);
        console.log(block_side);
        console.log(player.positionX);
        console.log(player.positionY);
    }

        //var blocks = array_blocks;

        if(    players[array_id[0]]?.positionX > (players[array_id[1]]?.positionX - 55)//? - чтоб не вылазила ошибка при undefined 
            && players[array_id[0]]?.positionX < (players[array_id[1]]?.positionX + 55) 
            && players[array_id[0]]?.positionY < (players[array_id[1]]?.positionY + 55) 
            && players[array_id[0]]?.positionY > players[array_id[1]]?.positionY - 55)
        {

            if(players[array_id[0]]?._space == true || players[array_id[1]]?._space == true){
                if(players[array_id[0]]?._space == true){
                    hot(players[array_id[1]], players[array_id[0]]);

                }else if(players[array_id[1]]?._space == true){
                    hot(players[array_id[0]], players[array_id[1]]);

                }
            }
        }
        
        io.sockets.emit("state", players);
}

setInterval(() => {
    if (players && io){
        gameLoop(players, io);
    }
}, 1000 / 60)
