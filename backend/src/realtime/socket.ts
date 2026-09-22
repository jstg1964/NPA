import { Server } from 'socket.io';

export const io = new Server(4001, {
  cors: { origin: '*' }
});

export function broadcast(event: string, data: unknown) {
  io.emit(event, data);
}
