import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  public connect(url?: string): Socket {
    if (this.socket) {
      return this.socket;
    }

    // Xác định URL: Nếu chạy qua Vite dev server (port 3000/5173), trỏ về backend port 9999, nếu production dùng window.location.origin
    const serverUrl = url || (window.location.port === '3000' || window.location.port === '5173' 
      ? 'http://localhost:9999' 
      : window.location.origin);

    console.log(`[SocketService] Connecting to Real-Time Gateway: ${serverUrl}`);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('⚡ [SocketService] Connected to Real-time Stream Gateway, Socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.warn('⚠️ [SocketService] Disconnected from Stream Gateway:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('❌ [SocketService] Connection error:', error.message);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinRoom(room: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', { room });
    }
  }

  public leaveRoom(room: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room', { room });
    }
  }

  public onTelemetryStream(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('telemetry_stream', callback);
    return () => {
      this.socket?.off('telemetry_stream', callback);
    };
  }

  public onServerStatusChanged(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('server_status_changed', callback);
    return () => {
      this.socket?.off('server_status_changed', callback);
    };
  }

  public onAlertCreated(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('alert_created', callback);
    return () => {
      this.socket?.off('alert_created', callback);
    };
  }

  public onAlertUpdated(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('alert_updated', callback);
    return () => {
      this.socket?.off('alert_updated', callback);
    };
  }

  public onTicketCreated(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('ticket_created', callback);
    return () => {
      this.socket?.off('ticket_created', callback);
    };
  }

  public onTicketUpdated(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('ticket_updated', callback);
    return () => {
      this.socket?.off('ticket_updated', callback);
    };
  }

  public onTelemetry(callback: (data: any) => void): () => void {
    return this.onTelemetryStream(callback);
  }

  public offTelemetry(callback: (data: any) => void): void {
    this.socket?.off('telemetry_stream', callback);
  }

  public onAlert(callback: (data: any) => void): () => void {
    return this.onAlertCreated(callback);
  }

  public offAlert(callback: (data: any) => void): void {
    this.socket?.off('alert_created', callback);
  }

  public onStatsUpdated(callback: (data: any) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('stats_updated', callback);
    return () => {
      this.socket?.off('stats_updated', callback);
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
