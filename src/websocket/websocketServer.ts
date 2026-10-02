import {
    WebSocketServer,
    WebSocket
} from 'ws';

import type { 
    Server 
} from 'http';

import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: number;
    role: 'reviewer' | 'submitter';
}

const clients = new Map<number, Set<WebSocket>>();


export function initializeWebSocketServer(
    server: Server
) {

    const wss = new WebSocketServer({
        server
    });

    wss.on('connection', (socket, request) => {

        try {

            const url = new URL(request.url ?? '', 'http://localhost');
            const token = url.searchParams.get('token');

            if (!token) {

                socket.close(1008, 'Authentication required');
                return;

            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as JwtPayload;

            const userId = decoded.id;

            if (!clients.has(userId)) {
                clients.set(userId, new Set());
            }

            clients.get(userId)?.add(socket);

            console.log(`WebSocket connnected for user ${userId}`);

            socket.send(
                JSON.stringify({
                    type: 'connection',
                    message: 'WebSocket authenticated successfully'
                })
                
            );

            socket.on('close', () => {

                const userSockets = clients.get(userId);

                userSockets?.delete(socket);

                if (userSockets?.size === 0) {
                    clients.delete(userId);
                }

                console.log(`WebSocket disconnected for user ${userId}`);
                
            });
        }
        catch (error) {

            socket.close(1008, 'Invalid or expired token');

        }

    });

    console.log('WebSocket server initialized');

}