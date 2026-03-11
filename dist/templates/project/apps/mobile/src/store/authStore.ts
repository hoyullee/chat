import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  login: async (email, password) => {
    const deviceId = await SecureStore.getItemAsync('deviceId') || crypto.randomUUID();
    const { data } = await api.post('/auth/login', { email, password, deviceId });
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    await SecureStore.setItemAsync('deviceId', deviceId);
    set({ user: data.user, accessToken: data.accessToken });
  },

  logout: async () => {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    await api.post('/auth/logout', { deviceId }).catch(() => {});
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, accessToken: null });
  },

  loadStoredAuth: async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      try {
        const { data } = await api.get('/users/me');
        set({ user: data, accessToken });
      } catch {
        set({ user: null, accessToken: null });
      }
    }
  },
}));
