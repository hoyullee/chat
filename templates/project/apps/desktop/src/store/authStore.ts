import { create } from 'zustand';
import { api } from '../services/api';

interface User { id: string; email: string; displayName: string; role: 'user' | 'admin'; }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  login: async (email, password) => {
    const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
    const { data } = await api.post('/auth/login', { email, password, deviceId });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('deviceId', deviceId);
    set({ user: data.user, accessToken: data.accessToken });
  },

  logout: async () => {
    const deviceId = localStorage.getItem('deviceId');
    await api.post('/auth/logout', { deviceId }).catch(() => {});
    localStorage.clear();
    set({ user: null, accessToken: null });
  },
}));
