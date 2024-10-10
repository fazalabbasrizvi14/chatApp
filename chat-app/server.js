const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // To store users and their associated socket IDs

app.use(express.static('public')); // Serve static files from the 'public' folder

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // Listen for the 'setUsername' event and store the user
    socket.on('setUsername', (username) => {
        // Check if username is already in use
        if (Object.values(users).includes(username)) {
            socket.emit('usernameTaken'); // Emit an event if the username is taken
        } else {
            users[socket.id] = username;
            io.emit('userList', Object.values(users)); // Update all users with the user list
            console.log(`User ${username} connected`);
        }
    });
    

    // Handle sending a private message
    socket.on('privateMessage', ({ recipient, message }) => {
        const recipientSocketId = Object.keys(users).find(key => users[key] === recipient);
        if (recipientSocketId) {
            // Send message to the recipient
            io.to(recipientSocketId).emit('privateMessage', {
                sender: users[socket.id],
                message
            });
        }
    });

    // Listen for user disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        delete users[socket.id];
        io.emit('userList', Object.values(users)); // Update user list
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
