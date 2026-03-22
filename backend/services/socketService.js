const socketIo = require('socket.io');

module.exports = {
    initSocket: (server, options) => {
        const io = socketIo(server, options);

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return io;
    }
};