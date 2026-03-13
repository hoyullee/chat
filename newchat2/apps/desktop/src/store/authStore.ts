import { create } from 'zustand';
import { api } from '../services/api';

interface User { id: string; email: string; displayName: string; role: 'user' | 'admin'; avatar?: string; backgroundImage?: string; }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; avatar?: string; backgroundImage?: string }) => Promise<User>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  init: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // localStorage에 user 캐시가 있으면 즉시 복원
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        set({ user: JSON.parse(userStr), accessToken: token });
        return;
      } catch {}
    }

    // 캐시 없으면 서버에서 가져옴 (이전 로그인 세션 호환)
    try {
      const { data } = await api.get('/users/me');
      const user: User = { id: data.id, email: data.email, displayName: data.displayName, role: data.role };
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, accessToken: token });
    } catch {
      localStorage.clear();
    }
  },

  login: async (email, password) => {
    const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
    const { data } = await api.post('/auth/login', { email, password, deviceId });
    const user: User = { id: data.user.id, email: data.user.email, displayName: data.user.displayName, role: data.user.role };
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('deviceId', deviceId);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken: data.accessToken });
  },

  updateProfile: async (data) => {
    const { data: updated } = await api.patch('/users/me', data);
    const user: User = { id: updated.id, email: updated.email, displayName: updated.displayName, role: updated.role, avatar: updated.avatar, backgroundImage: updated.backgroundImage };
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
    return user;
  },

  logout: async () => {
    const deviceId = localStorage.getItem('deviceId');
    await api.post('/auth/logout', { deviceId }).catch(() => {});
    localStorage.clear();
    set({ user: null, accessToken: null });
  },
}));
