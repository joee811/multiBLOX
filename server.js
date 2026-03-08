const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let players = {};

io.on('connection', (socket) => {
    console.log('Player joined:', socket.id);
    players[socket.id] = { x: 0, y: 1, z: 0, color: Math.random() * 0xffffff };

    socket.emit('init', { id: socket.id, players });
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            Object.assign(players[socket.id], data);
            socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('removePlayer', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
