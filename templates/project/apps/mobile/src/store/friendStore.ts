import { create } from 'zustand';
import { api } from '../services/api';

interface Friend {
  id: string;
  displayName: string;
  email: string;
  status: string;
}

interface FriendState {
  friends: Friend[];
  loadFriends: () => Promise<void>;
  addFriend: (addresseeId: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],

  loadFriends: async () => {
    const { data } = await api.get('/friends');
    set({ friends: data });
  },

  addFriend: async (addresseeId) => {
    await api.post('/friends/request', { addresseeId });
  },
}));
