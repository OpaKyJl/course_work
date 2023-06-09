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


//при запросе на переход на localhost ответом отправляется index.html 
app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "index.html"));
});

//массив препятствий (блоков)
var array_blocks = [];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
server.listen(5000, () => {
    console.log("Starting server on port 5000");

    width = 1610;
    height = 920;
    const WINDOW_WIDTH = width;
    const WINDOW_HIGHT = height;
    
    /////////////////////////////////////////////////////////////////////////////////////////////////
    //рисуем препятствия (при запуске сервера)
    for(i=0; i < 10; i++){
        let x0 = Math.floor(Math.random()* ((WINDOW_WIDTH - 60 )- 100) + 100);
        let y0 = Math.floor(Math.random()* ((WINDOW_HIGHT - 60) - 160) + 160);
        let sizex = Math.floor(Math.random()* (100 - 20) + 20);
        let sizey = Math.floor(Math.random()* (100 - 20) + 20);
        let x1 = sizex;
        let y1 = sizey;
    
           array_blocks.push([x0, y0, x1, y1]);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////

    //отправка клиенту массива с данными о препятствии
    setInterval(() => {
        io.sockets.emit("drawedBlocks", array_blocks);
    }, 1000 )

});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//таймер выбора воды
var timer;
var done = true;

//таймер самой игры
var timer_game;
var done_game_timer = true;

//состояние игроков
let players = null;

io.on("connection", (socket) => {

    //добавляется игрок
    players = getPlayers(socket);

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //начинается таймер выбора воды при нажатии на кнопку
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
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////
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
    /////////////////////////////////////////////////////////////////////////////////////////////////

});

//функция "осаливания"
function hot(player_hot, player_cold){
    player_hot._hot = true;
    player_cold._hot = false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//состояние игры
const gameLoop = (players, io) => {

    //массив айдишников
    let array_id = [];
        let i = 0;
        for (const id in players) {
            array_id[i] = id;
            i++;
        }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //проверка соприкосновения с блоком
    for (const id in players) {
        const player = players[id];

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
                
            }
        }

        player._block_side = block_side;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //проверка соприкосновени игрока с другим игроком + "осаливание"
    players_1 = players;
    players_2 = players;
    for (const id_1 in players_1) {
        const player_1 = players_1[id_1];

        for (const id_2 in players_2) {
            const player_2 = players_2[id_2];

            //проверка, чтоб не тыкал сам на себя
            if(player_1?._id != player_2?._id){
                if(    player_1?.positionX > (player_2?.positionX - 55)//? - чтоб не вылазила ошибка при undefined 
                && player_1?.positionX < (player_2?.positionX + 55) 
                && player_1?.positionY < (player_2?.positionY + 55) 
                && player_1?.positionY > player_2?.positionY - 55 
                && player_1?._visible == true && player_2?._visible)
                {
                    if(player_1?._space == true || player_2?._space == true){
                        if(player_1?._space == true && player_1?._hot == true){
                            hot(player_2, player_1);
                        }else if(player_2?._space == true && player_2?._hot == true){
                            hot(player_1, player_2);
                        }
                    }
                }
            }

        }
    }

    //создаём массив оставшихся (видимых) игроков
    let array_visible = [];
        let j = 0;
        for (const id in players) {
            if(players[id]._visible){
                array_visible[j] = id;
                j++;
            }
        }

    //срабатывание таймера воды
    if(timer == 0 && !done){
        let random = Math.round(Math.random()*(array_visible.length - 1));//к ближайшему целому
        players[array_visible[random]]._hot = true;
        done = true;
    }

    //срабатывание таймера игры
    if(timer_game == 0 && !done_game_timer){
        
        for (const id in players) {
            const player = players[id];
            if(player._hot == true && array_visible.length != 1){
                player._visible = false;
            }else{
                player._hot = false;
            } 
        }

        done_game_timer = true;
    }

    var players_limit = 3;

    for (i=players_limit;i<array_id.length;i++) {
        const player = players[array_id[i]];
        player._visible = false;
    }

    //отправляем данные о состоянии игры
    io.sockets.emit("state", players);
    if(array_visible.length == 1) io.sockets.emit("game_end", true);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//отправление клиенту данные о состоянии игры 60 раз в секунду
setInterval(() => {
    if (players && io){
        gameLoop(players, io);
    }
}, 1000 / 60)
