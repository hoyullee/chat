import React from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/auth/LoginPage';
import { MainLayout } from './pages/MainLayout';

export default function App() {
  const user = useAuthStore((s) => s.user);
  return user ? <MainLayout /> : <LoginPage />;
}
