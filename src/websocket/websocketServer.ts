import {
    WebSocketServer,
    WebSocket
} from 'ws';

import type { Server } from 'http';

let wss: WebSocketServer;

export function initializeWebSocketServer(
    server: Server
) {

    wss = new WebSocketServer({
        server
    });

    wss.on('connection', (socket: WebSocket) => {

        console.log('WebSocket client connected');

        socket.send(

            JSON.stringify({
                type: 'connnection',
                message: 'Connected to Code Collaborative Review'
            })

        );

        socket.on('close', () => {

            console.log('WebSocket client disconnected');
            
        });

    });

    console.log('WebSocket server initialized');

}