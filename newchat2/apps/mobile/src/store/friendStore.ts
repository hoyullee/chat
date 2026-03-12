import { create } from 'zustand';
import { api } from '../services/api';

interface Friend {
  id: string;
  displayName: string;
  email: string;
  status: string;
}

interface SearchUser {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
}

interface FriendState {
  friends: Friend[];
  searchResults: SearchUser[];
  loadFriends: () => Promise<void>;
  addFriend: (addresseeId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  searchResults: [],

  loadFriends: async () => {
    const { data } = await api.get('/friends');
    set({ friends: data });
  },

  addFriend: async (addresseeId) => {
    await api.post('/friends/request', { addresseeId });
    const { data } = await api.get('/friends');
    set({ friends: data });
  },

  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    const { data } = await api.get('/users/search', { params: { q: query } });
    set({ searchResults: data });
  },

  clearSearch: () => set({ searchResults: [] }),
}));
