import React, { useEffect, useState } from 'react';
import { FriendsPage } from './friends/FriendsPage';
import { ChatsPage } from './chats/ChatsPage';
import { AdminPage } from './admin/AdminPage';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useFriendStore } from '../store/friendStore';
import { TitleBar } from '../components/TitleBar';
import { useSocket } from '../hooks/useSocket';

type Tab = 'friends' | 'chats' | 'more';

export function MainLayout() {
  const [tab, setTab] = useState<Tab>('friends');
  const [showAdmin, setShowAdmin] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'admin';
  const socket = useSocket();

  // 탭 전환과 무관하게 채팅창(별도 window) 메시지를 항상 수신
  useEffect(() => {
    const bc = new BroadcastChannel('chat-updates');
    bc.onmessage = (e) => {
      if (e.data?.type === 'new-message') {
        useChatStore.getState().updateLastMessage(e.data.roomId, e.data.content);
      }
    };
    return () => bc.close();
  }, []);

  // 다른 유저의 프로필 변경을 실시간으로 반영
  useEffect(() => {
    socket.on('profile-updated', (data: { userId: string; avatar?: string; backgroundImage?: string; displayName?: string }) => {
      useFriendStore.getState().updateFriendProfile(data.userId, {
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.backgroundImage !== undefined && { backgroundImage: data.backgroundImage }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
      });
    });
    return () => { socket.off('profile-updated'); };
  }, [socket]);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t !== 'more') setShowAdmin(false);
  };

  const friendsIcon = (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="3.5" stroke={active ? '#3A1D1D' : '#7a6a2a'} strokeWidth={active ? 2 : 1.6} fill={active ? 'rgba(58,29,29,0.12)' : 'none'} />
      <path d="M2 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={active ? '#3A1D1D' : '#7a6a2a'} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <circle cx="18" cy="8" r="2.5" stroke={active ? '#3A1D1D' : '#7a6a2a'} strokeWidth={active ? 1.8 : 1.4} />
      <path d="M15.5 18c0-2.485 1.567-4 3.5-4 1.933 0 3.5 1.5 3.5 4" stroke={active ? '#3A1D1D' : '#7a6a2a'} strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
    </svg>
  );

  const chatsIcon = (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1z"
        stroke={active ? '#3A1D1D' : '#7a6a2a'}
        strokeWidth={active ? 2 : 1.6}
        fill={active ? 'rgba(58,29,29,0.12)' : 'none'}
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1" fill={active ? '#3A1D1D' : '#7a6a2a'} />
      <circle cx="12" cy="10" r="1" fill={active ? '#3A1D1D' : '#7a6a2a'} />
      <circle cx="15" cy="10" r="1" fill={active ? '#3A1D1D' : '#7a6a2a'} />
    </svg>
  );

  const moreIcon = (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="12" r="1.5" fill={active ? '#3A1D1D' : '#7a6a2a'} />
      <circle cx="12" cy="12" r="1.5" fill={active ? '#3A1D1D' : '#7a6a2a'} />
      <circle cx="19" cy="12" r="1.5" fill={active ? '#3A1D1D' : '#7a6a2a'} />
      {active && <rect x="2" y="5" width="20" height="14" rx="4" stroke="#3A1D1D" strokeWidth="1.6" fill="rgba(58,29,29,0.08)" />}
    </svg>
  );

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
      <TitleBar />
      {/* 콘텐츠 영역 */}
      <div key={tab} className="tab-content" style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'friends' && <FriendsPage />}
        {tab === 'chats'   && <ChatsPage />}
        {tab === 'more'    && renderMore()}
      </div>

      {/* 하단 GNB */}
      <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.08)', background: '#FEE500', height: 58 }}>
        {([
          ['friends', '친구', friendsIcon],
          ['chats',   '채팅', chatsIcon],
          ['more',    '더 보기', moreIcon],
        ] as [Tab, string, (active: boolean) => React.ReactNode][]).map(([t, label, renderIcon]) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, border: 'none', background: 'transparent',
                cursor: 'pointer', padding: 0, position: 'relative',
                transition: 'opacity 0.1s',
              }}
            >
              {/* 상단 인디케이터 */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: active ? 28 : 0, height: 2.5, borderRadius: '0 0 3px 3px',
                background: '#3A1D1D', transition: 'width 0.2s ease',
              }} />
              {renderIcon(active)}
              <span style={{
                fontSize: 10.5, fontWeight: active ? 700 : 500,
                color: active ? '#3A1D1D' : '#7a6a2a',
                letterSpacing: '-0.2px', transition: 'color 0.15s',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
