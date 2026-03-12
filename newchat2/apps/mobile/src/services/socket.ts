import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const userId = 'placeholder'; // authStore에서 가져와야 함
  const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  socket = io(SOCKET_URL, { query: { userId }, autoConnect: true });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
