import React, { useState } from 'react';
import { FriendsPage } from './friends/FriendsPage';
import { ChatsPage } from './chats/ChatsPage';
import { AdminPage } from './admin/AdminPage';
import { useAuthStore } from '../store/authStore';

type Tab = 'friends' | 'chats' | 'more';

export function MainLayout() {
  const [tab, setTab] = useState<Tab>('friends');
  const [showAdmin, setShowAdmin] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'admin';

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t !== 'more') setShowAdmin(false);
  };

  const renderMore = () => {
    if (showAdmin) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee', background: '#fff' }}>
            <button onClick={() => setShowAdmin(false)} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#555', marginRight: 8 }}>‹</button>
            <span style={{ fontWeight: 'bold', fontSize: 15 }}>회원관리</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <AdminPage />
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: 16 }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', marginBottom: 16, background: '#fff', borderRadius: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: '#FEE500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20 }}>
              {user.displayName?.[0] ?? '?'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 15 }}>{user.displayName}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{user.email}</div>
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 6, paddingLeft: 4 }}>관리</div>
            <button
              onClick={() => setShowAdmin(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', marginBottom: 16, borderRadius: 10, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 14 }}
            >
              <span style={{ fontSize: 18 }}>⚙️</span>
              <span style={{ flex: 1, textAlign: 'left' }}>회원관리</span>
              <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
            </button>
          </>
        )}

        <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 6, paddingLeft: 4 }}>계정</div>
        <button
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 10, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#f44336' }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span style={{ flex: 1, textAlign: 'left' }}>로그아웃</span>
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9f9f9' }}>
      {/* 콘텐츠 영역 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'friends' && <FriendsPage />}
        {tab === 'chats'   && <ChatsPage />}
        {tab === 'more'    && renderMore()}
      </div>

      {/* 하단 GNB */}
      <div style={{ display: 'flex', borderTop: '1px solid #ddd', background: '#FEE500', height: 56 }}>
        {([['friends', '👥', '친구'], ['chats', '💬', '채팅'], ['more', '☰', '더 보기']] as [Tab, string, string][]).map(([t, icon, label]) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 2, border: 'none', background: 'transparent',
              cursor: 'pointer',
              borderTop: tab === t ? '3px solid #3A1D1D' : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 11, fontWeight: tab === t ? 'bold' : 'normal', color: '#3A1D1D' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
