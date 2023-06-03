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
img.src = "https://lh3.googleusercontent.com/VJh9Caz9ToCNY5Ny71MDpf_bHhFCDjl_ao3AW5i3LeOEvXNA3PdBY-GAHhVKX-8VzD5Z_aMYEVK_stWgoNY1oJN076JpvhR_8L9hg5o";

socket.on("state", (players) => {
    let timer = 15;
    context.beginPath();
    context.drawImage(img, 0, 0, WINDOW_WIDTH, WINDOW_HIGHT);
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
            if(i == 0){
                player._hot = true;
            }
            drawPlayer(context, player);
        }
    }else{
        for (const id in players) {
            const player = players[id];
                drawPlayer(context, player);
        }
    }
    
});