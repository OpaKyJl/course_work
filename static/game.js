const socket = io();

width = 1610;//1920 - 300 - 10;//1600;
height = 920//1080 - 150 - 10;//800;
const WINDOW_WIDTH = width;
const WINDOW_HIGHT = height;

const canvas = document.getElementById("canvas");
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HIGHT;
const context = canvas.getContext("2d");

let _name = prompt("Введите имя (до 15 символов)");

while (_name === "" || _name === null){
    _name = prompt("Введите имя (до 15 символов)");
}
while (_name.length > 15){
    _name = prompt("Введите имя (до 15 символов)");
}

const start_game = document.getElementById("start_game");
const timer = document.getElementById("timer");

//таймер по кнопке пошёл заного
//сделать чтобы если игроков меньше 2 таймер не запускался
start_game.addEventListener('click', () => {
        let count = 30;
        socket.emit("start_game", count);
})

//кнопка не отображается, пока идёт таймер
socket.on("timer_started", () => {
    start_game.style.display = "none";
})

//кнопка снова отображается, когда таймер закончился
socket.on("timer_stoped", () => {
    start_game.style.display = "block";
})

//таймер
socket.on("timer", (time) => {
    timer.textContent = time;
});

//проверка работоспособности столкновения
socket.on("crush", (msg) => {
    alert(msg);
    //window.location.reload();
})

socket.emit("new player", _name);//при добавлении игрока спрашиваем его имя и записываем
var img = new Image();
img.src = "http://danila_pavlovv.istu.webappz.ru/img/background.jpg";

///////////////////////////////////////////////////////////////////////////////////////////////

//вынести на сервер
/*let array_blocks = ["x0", "y0", "x1", "y1"];

for(i=0; i < 10; i++){
    let x0 = Math.floor(Math.random()* (WINDOW_WIDTH - 60));
    let y0 = Math.floor(Math.random()* (WINDOW_HIGHT - 60));
    let sizex = Math.floor(Math.random()* (100 - 20) + 20);
    let sizey = Math.floor(Math.random()* (100 - 20) + 20);
    let x1 = sizex;
    let y1 = sizey;

    array_blocks.push([x0, y0, x1, y1]);
}*/

///////////////////////////////////////////////////////////////////////////////////////////////
var array_blocks;
socket.on("drawedBlocks", (array) => {
    array_blocks = array;
})

socket.on("state", (players) => {
    context.beginPath();
    context.drawImage(img, 0, 0, WINDOW_WIDTH, WINDOW_HIGHT);
    for(j = 0; j < array_blocks.length; j++){
        context.fillRect(array_blocks[j][0] ,array_blocks[j][1], array_blocks[j][2], array_blocks[j][3]);
    }
    context.closePath();


    let array_id = [];
    let i = 0;
    for (const id in players) {
        array_id[i] = id;
        i++;
    }

    if(Object.keys(players).length > 2){
        for (i=0;i<2;i++) {
            const player = players[array_id[i]];
            drawPlayer(context, player);
        }
    }else{
        for (const id in players) {
            const player = players[id];
                drawPlayer(context, player);
        }
    }
    
});
