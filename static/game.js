const socket = io();

width = 1610;
height = 920;
const WINDOW_WIDTH = width;
const WINDOW_HIGHT = height;

const canvas = document.getElementById("canvas");
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HIGHT;
const context = canvas.getContext("2d");

let _name = prompt("Введите имя (до 15 символов)");

var players_limit = 3;
var game_started = false;
var count_players;
var visibles = false;

//ввод имени
while (_name === "" || _name === null || _name.length > 15){
    _name = prompt("Введите имя (до 15 символов)");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//сюда понавставлял CSS, чтоб не париться

const start_game = document.getElementById("start_game");
start_game.style.width = "150px";
start_game.style.height = "80px";
start_game.style.fontSize = "30px";

const timer = document.getElementById("timer");
timer.style.width = "150px";
timer.style.height = "30px";
timer.style.fontSize = "30px";
timer.style.textAlign = "center";

const timer_game = document.getElementById("timer_game");
timer_game.style.width = "150px";
timer_game.style.height = "30px";
timer_game.style.fontSize = "30px";
timer_game.style.textAlign = "center";

const watcher = document.getElementById("watcher");
watcher.style.width = "150px";
watcher.style.height = "30px";
watcher.style.fontSize = "30px";
watcher.style.margin ="auto";
watcher.style.display ="inline-block";

const winner = document.getElementById("winner");
winner.style.width = "150px";
winner.style.height = "30px";
winner.style.fontSize = "30px";
winner.style.margin ="auto";
winner.style.display ="inline-block";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//по кнопке начинается игра (стартует таймер выбора воды)
start_game.addEventListener('click', () => {
        let count = 5;
        socket.emit("start_game", count);
})

//кнопка не отображается, пока идёт таймер
socket.on("timer_started", () => {
    start_game.style.display = "none";
    game_started = true;
})

//когда выберется вода, запустится таймер игры
socket.on("timer_stoped", () => {
    let count = 5;
    socket.emit("timer_game_start", count); 
})

//кнопка снова отображается, когда таймер закончился
socket.on("timer_game_stoped", (time) => {
    start_game.style.display = "block";
    game_started = false;
    if(winner.textContent == "x" || player_winner != winner.textContent ) start_game.click();
});


//таймер выбора воды
socket.on("timer", (time) => {
    timer.textContent = time;
});

//таймер самой игры
socket.on("timer_game", (time) => {
    timer_game.textContent = time;
});

//при добавлении игрока спрашиваем его имя и записываем
socket.emit("new player", _name);

//массив с данными о препядствиях (блоках)
var array_blocks;
socket.on("drawedBlocks", (array) => {
    array_blocks = array;
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//обновление состояния игры

socket.on("state", (players) => {

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //отрисовка фона

    context.beginPath();
    context.fillStyle = "rgb(10, 32, 224)";
    context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HIGHT);
    context.fillStyle = "rgb(240, 247, 21)";

    //отрисовка препятствий
    for(j = 0; j < array_blocks.length; j++){
        context.fillRect(array_blocks[j][0] ,array_blocks[j][1], array_blocks[j][2], array_blocks[j][3]);
    }
    context.closePath();

    /////////////////////////////////////////////////////////////////////////////////////////////////

    //массив айдишников
    let array_id = [];
    let i = 0;
    for (const id in players) {
        array_id[i] = id;
        i++;
    }

    let count_visibles = 0;
    let visible_id;

    //запоминаем "видимых" игроков
    for (i=0;i<players_limit;i++) {
        const player = players[array_id[i]];
        if(player?._visible){
            count_visibles++;
            visible_id = array_id[i];
        } 
    }

    //отображение, кто победитель
    if(count_visibles == 1 && (Object.keys(players).length > 1)){
        winner.textContent = players[visible_id]._name;
        player_winner = players[visible_id]._name;

    }

    //отрисовка игроков (не больше установленного лимита (сейчас = 3))
    if(Object.keys(players).length > players_limit){
        for (i=0;i<players_limit;i++) {
            const player = players[array_id[i]];
            if(player._visible) drawPlayer(context, player);
        }
    }else{
        for (const id in players) {
            const player = players[id];
            if(player._visible) drawPlayer(context, player);
        }
    }

    if(Object.keys(players).length > count_visibles) watcher.textContent = (Object.keys(players).length - count_visibles);
    if(Object.keys(players).length <= count_visibles) watcher.textContent = 0;
    if(Object.keys(players).length < 2 || count_visibles == 1) start_game.style.display = "none";
    else if(!game_started){
        start_game.style.display = "block";
    }
    
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
