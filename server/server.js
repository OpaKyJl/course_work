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
        let x0 = Math.floor(Math.random()* ((WINDOW_WIDTH - 60 )- 100) + 100);
        let y0 = Math.floor(Math.random()* ((WINDOW_HIGHT - 60) - 160) + 160);
        let sizex = Math.floor(Math.random()* (100 - 20) + 20);
        let sizey = Math.floor(Math.random()* (100 - 20) + 20);
        let x1 = sizex;
        let y1 = sizey;
    
           array_blocks.push([x0, y0, x1, y1]);
    }
    module.exports.array_blocks = () =>{
        return array_blocks;
    };
    array = array_blocks;

    setInterval(() => {
        io.sockets.emit("drawedBlocks", array);
    }, 1000 )

});

var timer;
var done = true;

var timer_game;
var done_game_timer = true;

let players = null;
io.on("connection", (socket) => {
    players = getPlayers(socket);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //начинается таймер при нажатии на кнопку
    socket.on("start_game", (count) => {
        io.sockets.emit("timer_started");
        const intervalId = setInterval(() => {
            timer = count;
            io.sockets.emit("timer", count);
            if(count>0) count--;
            else {
                clearInterval(intervalId);//когда таймер закончится, перестать его выполнять
                io.sockets.emit("timer_stoped");
                done = false;
            }
        }, 1000)
    })

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //таймер самой игры
    socket.on("timer_game_start", (count) => {
        io.sockets.emit("timer_game_started");
        const intervalId = setInterval(() => {
            timer_game = count;
            io.sockets.emit("timer_game", count);
            if(count>0) count--;
            else {
                clearInterval(intervalId);//когда таймер закончится, перестать его выполнять
                io.sockets.emit("timer_game_stoped");
                done_game_timer = false;
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

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //массив айдишников
    let array_id = [];
        let i = 0;
        for (const id in players) {
            array_id[i] = id;
            i++;
        }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //проверка соприкосновения с блоком
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
                if((player.positionX < (array_blocks[i][0] + array_blocks[i][2] + 30)) && (player.positionX > (array_blocks[i][0] + array_blocks[i][2]))) block_side = "right";
                if((player.positionX > (array_blocks[i][0] - 30)) && (player.positionX < (array_blocks[i][0] - 15))) block_side = "left";
                if((player.positionY < (array_blocks[i][1] + array_blocks[i][3] + 30)) && (player.positionY > (array_blocks[i][1] + array_blocks[i][3]))) block_side = "down";
                if((player.positionY > (array_blocks[i][1] - 30)) && (player.positionY < (array_blocks[i][1] - 15))) block_side = "up";

                if((player.positionX < (array_blocks[i][0] + array_blocks[i][2] + 30)) && (player.positionX > (array_blocks[i][0] + array_blocks[i][2])) && (player.positionY > (array_blocks[i][1] - 30)) && (player.positionY < (array_blocks[i][1] - 15))) block_side = "right-up";
                if((player.positionX < (array_blocks[i][0] + array_blocks[i][2] + 30)) && (player.positionX > (array_blocks[i][0] + array_blocks[i][2])) && (player.positionY < (array_blocks[i][1] + array_blocks[i][3] + 30)) && (player.positionY > (array_blocks[i][1] + array_blocks[i][3]))) block_side = "right-down";
                if((player.positionX > (array_blocks[i][0] - 30)) && (player.positionX < (array_blocks[i][0] - 15)) && (player.positionY > (array_blocks[i][1] - 30)) && (player.positionY < (array_blocks[i][1] - 15))) block_side = "left-up";
                if((player.positionX > (array_blocks[i][0] - 30)) && (player.positionX < (array_blocks[i][0] - 15)) && (player.positionY < (array_blocks[i][1] + array_blocks[i][3] + 30)) && (player.positionY > (array_blocks[i][1] + array_blocks[i][3]))) block_side = "left-down";
                touch++;
            }
        }

        player._block_side = block_side;
        //console.log(array_blocks);
        //console.log(player._touch);
        //console.log(block_side);
        //console.log(player.positionX);
        //console.log(player.positionY);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //проверка, что второй игрок в радиусе действия и его можно "осалить"
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
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //считываем таймер игры
    //console.log(timer);
    //let done = false;
    //console.log(timer);
    //console.log(done);
    if(timer == 0 && !done){
        
        let random = Math.round(Math.random());//к ближайшему целом
        switch(random){
            case 0:
                players[array_id[0]]._hot = true;
                break;
            case 1:
                players[array_id[1]]._hot = true;
                break;
        }
        done = true;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //отправляем данные о состоянии игры
    io.sockets.emit("state", players);
}

setInterval(() => {
    if (players && io){
        gameLoop(players, io);
    }
}, 1000 / 60)
