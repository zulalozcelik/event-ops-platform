import { clientEnv } from '@/lib/config/env';

export interface EventCapacityUpdatedPayload {
  eventId: string;
  registeredCount: number;
  waitlistCount: number;
  remainingCapacity: number;
}

interface EventCapacitySocket {
  on(
    event: 'connect' | 'disconnect',
    listener: () => void,
  ): EventCapacitySocket;
  on(
    event: 'event.capacity.updated',
    listener: (payload: EventCapacityUpdatedPayload) => void,
  ): EventCapacitySocket;
  emit(
    event: 'event.capacity.subscribe' | 'event.capacity.unsubscribe',
    payload: { eventId: string },
  ): EventCapacitySocket;
  disconnect(): void;
}

interface SocketIoFactory {
  (
    url: string,
    options: {
      withCredentials: boolean;
      transports: ['websocket'];
    },
  ): EventCapacitySocket;
}

declare global {
  interface Window {
    io?: SocketIoFactory;
  }
}

const SOCKET_SCRIPT_ID = 'event-capacity-socket-script';

export function getSocketBaseUrl(): string {
  return new URL(clientEnv.NEXT_PUBLIC_API_URL).origin;
}

export function loadSocketIoClient(): Promise<SocketIoFactory> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Socket client can only load in the browser'));
  }

  if (window.io) {
    return Promise.resolve(window.io);
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SOCKET_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.io) {
          resolve(window.io);
          return;
        }

        reject(new Error('Socket.IO client did not initialize'));
      });

      existingScript.addEventListener('error', () => {
        reject(new Error('Socket.IO client script failed to load'));
      });

      return;
    }

    const script = document.createElement('script');
    script.id = SOCKET_SCRIPT_ID;
    script.src = `${getSocketBaseUrl()}/socket.io/socket.io.js`;
    script.async = true;

    script.onload = () => {
      if (window.io) {
        resolve(window.io);
        return;
      }

      reject(new Error('Socket.IO client did not initialize'));
    };

    script.onerror = () => {
      reject(new Error('Socket.IO client script failed to load'));
    };

    document.body.appendChild(script);
  });
}

export async function createEventCapacitySocket(): Promise<EventCapacitySocket> {
  const io = await loadSocketIoClient();

  return io(getSocketBaseUrl(), {
    withCredentials: true,
    transports: ['websocket'],
  });
}
