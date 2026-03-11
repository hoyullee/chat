import React, { useState } from 'react';
import { FriendsPage } from './friends/FriendsPage';
import { ChatsPage } from './chats/ChatsPage';
import { AdminPage } from './admin/AdminPage';
import { useAuthStore } from '../store/authStore';

type Tab = 'chats' | 'friends' | 'admin';

export function MainLayout() {
  const [tab, setTab] = useState<Tab>('chats');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'admin';

  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex: 1, padding: 12, background: tab === t ? '#FEE500' : 'transparent',
    border: 'none', cursor: 'pointer', fontWeight: tab === t ? 'bold' : 'normal',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff' }}>
        <button onClick={() => setTab('friends')} style={tabStyle('friends')}>친구</button>
        <button onClick={() => setTab('chats')} style={tabStyle('chats')}>채팅</button>
        {isAdmin && <button onClick={() => setTab('admin')} style={{ ...tabStyle('admin'), color: '#ff6b00' }}>회원관리</button>}
        <button onClick={logout} style={{ padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}>
          로그아웃
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'friends' && <FriendsPage />}
        {tab === 'chats' && <ChatsPage />}
        {tab === 'admin' && isAdmin && <AdminPage />}
      </div>
    </div>
  );
}
