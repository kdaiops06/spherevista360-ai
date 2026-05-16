type QuoteMessage = {
  type: string;
  data?: Array<{ s: string; p: number; t: number }>;
};

const FINNHUB_WS = "wss://ws.finnhub.io";

class FinnhubSocketManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscriptions = new Set<string>();
  private latestQuotes = new Map<string, { price: number; updatedAt: number }>();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private lastConnectedAt: string | undefined;
  private lastMessageAt: string | undefined;
  private lastReconnectAt: string | undefined;
  private lastError: string | undefined;

  subscribe(symbols: string[]): void {
    for (const symbol of symbols) {
      if (symbol) {
        this.subscriptions.add(symbol.toUpperCase());
      }
    }
    this.ensureConnected();
    this.flushSubscriptions();
  }

  unsubscribe(symbols: string[]): void {
    for (const symbol of symbols) {
      const clean = symbol.toUpperCase();
      this.subscriptions.delete(clean);
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "unsubscribe", symbol: clean }));
      }
    }
  }

  getLatest(symbol: string): { price: number; updatedAt: number } | null {
    return this.latestQuotes.get(symbol.toUpperCase()) ?? null;
  }

  private ensureConnected(): void {
    if (!process.env.FINNHUB_API_KEY || this.isConnecting || this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    const url = `${FINNHUB_WS}?token=${process.env.FINNHUB_API_KEY}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.lastConnectedAt = new Date().toISOString();
      this.lastError = undefined;
      console.info("[finnhub-ws] connected", {
        subscribedSymbols: this.subscriptions.size,
      });
      this.flushSubscriptions();
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as QuoteMessage;
        if (message.type !== "trade" || !Array.isArray(message.data)) {
          return;
        }
        for (const trade of message.data) {
          if (!trade.s || !Number.isFinite(trade.p)) {
            continue;
          }
          this.lastMessageAt = new Date().toISOString();
          this.latestQuotes.set(trade.s.toUpperCase(), {
            price: trade.p,
            updatedAt: trade.t || Date.now(),
          });
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.socket.onerror = (event) => {
      this.lastError = typeof ErrorEvent !== "undefined" && event instanceof ErrorEvent ? event.message : "websocket_error";
      console.warn("[finnhub-ws] error", {
        error: this.lastError,
      });
      this.scheduleReconnect();
    };

    this.socket.onclose = () => {
      console.warn("[finnhub-ws] closed, reconnect scheduled");
      this.scheduleReconnect();
    };
  }

  private flushSubscriptions(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    for (const symbol of this.subscriptions) {
      this.socket.send(JSON.stringify({ type: "subscribe", symbol }));
    }
  }

  private scheduleReconnect(): void {
    this.isConnecting = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectAttempts += 1;
    this.lastReconnectAt = new Date().toISOString();
    console.warn("[finnhub-ws] reconnect-attempt", {
      attempt: this.reconnectAttempts,
    });
    this.reconnectTimer = setTimeout(() => {
      this.ensureConnected();
    }, 2000);
  }

  getDiagnostics() {
    return {
      connected: this.socket?.readyState === WebSocket.OPEN,
      reconnectAttempts: this.reconnectAttempts,
      subscribedSymbols: this.subscriptions.size,
      lastConnectedAt: this.lastConnectedAt,
      lastMessageAt: this.lastMessageAt,
      lastReconnectAt: this.lastReconnectAt,
      lastError: this.lastError,
    };
  }
}

export const finnhubSocketManager = new FinnhubSocketManager();
