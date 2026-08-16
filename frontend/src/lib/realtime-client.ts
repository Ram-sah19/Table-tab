export type RealtimeCallback = (payload: {
  channel: string;
  event: string;
  data: any;
  timestamp: string;
}) => void;

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<RealtimeCallback> = new Set();
  private reconnectTimer: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.connect();
    }
  }

  private connect() {
    if (typeof window === "undefined") return;

    try {
      this.eventSource = new EventSource("/api/realtime");

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.listeners.forEach((callback) => callback(payload));
        } catch {
          // heartbeat or non-json message
        }
      };

      this.eventSource.onerror = () => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Auto-reconnect after 3s
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 3000);
        }
      };
    } catch {
      // Offline fallback
    }
  }

  public subscribe(
    channel: string,
    callback: (event: string, data: any) => void
  ): () => void {
    const handler: RealtimeCallback = (payload) => {
      if (payload.channel === channel) {
        callback(payload.event, payload.data);
      }
    };

    this.listeners.add(handler);

    return () => {
      this.listeners.delete(handler);
    };
  }
}

export const realtimeClient = new RealtimeClient();
