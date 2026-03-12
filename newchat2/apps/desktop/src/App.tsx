import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/auth/LoginPage';
import { MainLayout } from './pages/MainLayout';
import { ChatRoom } from './pages/chats/ChatRoom';

export default function App() {
  const user = useAuthStore((s) => s.user);
  const init = useAuthStore((s) => s.init);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5' }}>
        <div style={{ width: 36, height: 36, border: '4px solid #FEE500', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);
  const chatRoomId = params.get('chatRoom');

  if (chatRoomId) {
    return user
      ? <div style={{ height: '100vh' }}><ChatRoom roomId={chatRoomId} /></div>
      : <LoginPage />;
  }

  return user ? <MainLayout /> : <LoginPage />;
}
