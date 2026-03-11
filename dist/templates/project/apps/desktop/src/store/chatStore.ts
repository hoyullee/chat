import { create } from 'zustand';
import { api } from '../services/api';

interface Message { id: string; roomId: string; senderId: string; content: string; type: string; isMine?: boolean; createdAt: string; }
interface ChatRoom { id: string; name: string; type: string; lastMessage?: string; }

interface ChatState {
  rooms: ChatRoom[];
  messages: Record<string, Message[]>;
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  addMessage: (roomId: string, msg: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  messages: {},
  loadRooms: async () => { const { data } = await api.get('/chat/rooms'); set({ rooms: data }); },
  loadMessages: async (roomId) => { const { data } = await api.get(`/chat/rooms/${roomId}/messages`); set({ messages: { ...get().messages, [roomId]: data.reverse() } }); },
  addMessage: (roomId, msg) => { const curr = get().messages[roomId] || []; set({ messages: { ...get().messages, [roomId]: [...curr, msg] } }); },
}));
