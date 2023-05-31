const socket = io();

width = 1920 - 300 - 10;//1600;
height = 1080 - 150 - 10;//800;
const WINDOW_WIDTH = width;
const WINDOW_HIGHT = height;

const canvas = document.getElementById("canvas");
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HIGHT;
const context = canvas.getContext("2d");

// message - текст сообщения (является не обязательным), предназначено для информирования пользователя о том, какие данные у него запрашиваются
// default - начальное значение для поля ввода, которое будет по умолчанию в нём отображаться (является не обязательным)
let _name = prompt("Введите имя (до 15 символов)");

while (_name === "" || _name === null){
    _name = prompt("Введите имя (до 15 символов)");
}
while (_name.length > 15){
    _name = prompt("Введите имя (до 15 символов)");
}


socket.emit("new player", _name);//при добавлении игрока спрашиваем его имя и записываем
var img = new Image();
img.src = "https://lh3.googleusercontent.com/VJh9Caz9ToCNY5Ny71MDpf_bHhFCDjl_ao3AW5i3LeOEvXNA3PdBY-GAHhVKX-8VzD5Z_aMYEVK_stWgoNY1oJN076JpvhR_8L9hg5o";

socket.on("state", (players) => {
    context.beginPath();
    //context.fillStyle = "black";
    context.drawImage(img, 0, 0, WINDOW_WIDTH, WINDOW_HIGHT);
    //context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HIGHT);
    context.closePath();
    for (const id in players) {
        const player = players[id];
        drawPlayer(context, player);
    }
});