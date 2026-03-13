import { create } from 'zustand';
import { api } from '../services/api';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
interface ChatRoom {
  id: string;
  name: string;
  type: string;
  lastMessage?: string | null;
  otherUser?: { id: string; displayName: string; avatar?: string } | null;
}

interface ChatState {
  rooms: ChatRoom[];
  messages: Record<string, Message[]>;
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  addMessage: (roomId: string, msg: Message) => void;
  updateLastMessage: (roomId: string, content: string) => void;
  markRead: (roomId: string, messageIds: string[]) => void;
  openDirectChat: (targetUserId: string) => Promise<string>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  messages: {},
  loadRooms: async () => { const { data } = await api.get('/chat/rooms'); set({ rooms: data }); },
  loadMessages: async (roomId) => {
    const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
    set({ messages: { ...get().messages, [roomId]: data.reverse() } });
  },
  addMessage: (roomId, msg) => {
    const curr = get().messages[roomId] || [];
    set({ messages: { ...get().messages, [roomId]: [...curr, msg] } });
  },
  updateLastMessage: (roomId: string, content: string) => {
    const rooms = get().rooms;
    const target = rooms.find((r) => r.id === roomId);
    if (!target) return;
    // 해당 방을 최신 메시지로 갱신 후 목록 맨 위로 이동
    const updated = [{ ...target, lastMessage: content }, ...rooms.filter((r) => r.id !== roomId)];
    set({ rooms: updated });
  },
  markRead: (roomId, messageIds) => {
    const curr = get().messages[roomId] || [];
    const updated = curr.map((m) => messageIds.includes(m.id) ? { ...m, isRead: true } : m);
    set({ messages: { ...get().messages, [roomId]: updated } });
  },
  openDirectChat: async (targetUserId) => {
    const { data } = await api.post('/chat/rooms/direct', { targetUserId });
    await get().loadRooms();
    return data.id as string;
  },
}));
