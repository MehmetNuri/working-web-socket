const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

// WebSocket Sunucusu
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (data) => {
        try {
            // Gelen mesajı string'e dönüştür
            const messageString = data.toString();

            // Mesajı JSON olarak parse et
            const parsedMessage = JSON.parse(messageString);

            console.log('Received JSON:', parsedMessage);

            // Gelen mesajı tüm bağlı istemcilere yayınla
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage)); // JSON formatında gönder
                }
            });
        } catch (error) {
            console.error('Invalid JSON format:', error.message);
        }
    });


    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

// Express ile statik dosya sunumu
app.use(express.static(path.join(__dirname, 'public')));

// HTTP Sunucusunu oluştur ve WebSocket'i entegre et
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
