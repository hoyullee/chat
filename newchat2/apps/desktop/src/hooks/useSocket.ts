import { useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const transports = import.meta.env.VITE_SOCKET_TRANSPORTS
  ? [import.meta.env.VITE_SOCKET_TRANSPORTS]
  : ['polling', 'websocket'];

export function useSocket(): Socket {
  const ref = useRef<Socket>();
  if (!ref.current) ref.current = io(SOCKET_URL, { autoConnect: true, transports });
  useEffect(() => () => { ref.current?.disconnect(); }, []);
  return ref.current;
}
