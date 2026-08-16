import { EventEmitter } from "node:events";

export const realtimeEmitter = new EventEmitter();
realtimeEmitter.setMaxListeners(200);

export type RealtimeChannel = "orders" | "service_requests" | `order:${string}`;

export function broadcastEvent(channel: string, eventType: string, data: unknown) {
  realtimeEmitter.emit("broadcast", {
    channel,
    event: eventType,
    data,
    timestamp: new Date().toISOString(),
  });
}
