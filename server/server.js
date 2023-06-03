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

server.listen(5000, () => {
    console.log("Starting server on port 5000");
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

const gameLoop = (players, io) => {

    let array_id = [];
        let i = 0;
        for (const id in players) {
            array_id[i] = id;
            i++;
        }

        if(    players[array_id[0]]?.positionX > (players[array_id[1]]?.positionX - 30)//? - чтоб не вылазила ошибка при undefined 
            && players[array_id[0]]?.positionX < (players[array_id[1]]?.positionX + 30) 
            && players[array_id[0]]?.positionY < (players[array_id[1]]?.positionY + 30) 
            && players[array_id[0]]?.positionY > players[array_id[1]]?.positionY - 30)
        {
            io.sockets.emit("crush");

            //тут передавать плэеров
            //что перенос картошки произошёл
            if(players[array_id[0]]._hot == false){
                io.sockets.emit("hot", players[array_id[1]], players[array_id[0]]);
            }else{
                io.sockets.emit("hot", players[array_id[0]], players[array_id[1]]);
            }
        }
    io.sockets.emit("state", players);
}

setInterval(() => {
    if (players && io){
        gameLoop(players, io);
    }
}, 1000 / 60)
