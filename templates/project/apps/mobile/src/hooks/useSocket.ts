import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useSocket(): Socket {
  const socketRef = useRef<Socket>();

  if (!socketRef.current) {
    socketRef.current = io(SOCKET_URL, { autoConnect: true });
  }

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}
