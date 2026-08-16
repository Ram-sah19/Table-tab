import { EventEmitter } from "node:events";
import { Server as SocketIOServer } from "socket.io";

export const realtimeEmitter = new EventEmitter();
realtimeEmitter.setMaxListeners(200);

export type RealtimeChannel = "orders" | "service_requests" | `order:${string}`;

let ioInstance: SocketIOServer | null = null;

export function setSocketServer(io: SocketIOServer) {
  ioInstance = io;
}

export function getSocketServer(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastEvent(channel: string, eventType: string, data: unknown) {
  const timestamp = new Date().toISOString();
  const payload = {
    channel,
    event: eventType,
    data,
    timestamp,
  };

  // 1. Emit to SSE listeners
  realtimeEmitter.emit("broadcast", payload);

  // 2. Emit to Socket.IO clients
  if (ioInstance) {
    ioInstance.to(channel).emit(eventType, data);
    ioInstance.emit("realtime:event", payload);
  }
}
