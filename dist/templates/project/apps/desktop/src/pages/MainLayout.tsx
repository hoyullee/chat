import React, { useState } from 'react';
import { FriendsPage } from './friends/FriendsPage';
import { ChatsPage } from './chats/ChatsPage';
import { useAuthStore } from '../store/authStore';

export function MainLayout() {
  const [tab, setTab] = useState<'friends' | 'chats'>('chats');
  const logout = useAuthStore((s) => s.logout);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff' }}>
        <button onClick={() => setTab('friends')} style={{ flex: 1, padding: 12, background: tab === 'friends' ? '#FEE500' : 'transparent', border: 'none', cursor: 'pointer', fontWeight: tab === 'friends' ? 'bold' : 'normal' }}>친구</button>
        <button onClick={() => setTab('chats')} style={{ flex: 1, padding: 12, background: tab === 'chats' ? '#FEE500' : 'transparent', border: 'none', cursor: 'pointer', fontWeight: tab === 'chats' ? 'bold' : 'normal' }}>채팅</button>
        <button onClick={logout} style={{ padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}>로그아웃</button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'friends' ? <FriendsPage /> : <ChatsPage />}
      </div>
    </div>
  );
}
