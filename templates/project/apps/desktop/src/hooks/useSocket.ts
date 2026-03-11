import { useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(): Socket {
  const ref = useRef<Socket>();
  if (!ref.current) ref.current = io(SOCKET_URL, { autoConnect: true });
  useEffect(() => () => { ref.current?.disconnect(); }, []);
  return ref.current;
}
