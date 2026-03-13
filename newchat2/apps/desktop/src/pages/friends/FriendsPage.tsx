import React, { useEffect, useState, useCallback } from 'react';
import { useFriendStore } from '../../store/friendStore';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { ProfileDetailPage, ProfileUser } from '../profile/ProfileDetailPage';

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

interface Props {
  onOpenChat?: (roomId: string) => void;
}

export function FriendsPage({ onOpenChat }: Props) {
  const { friends, searchResults, loadFriends, searchUsers, addFriend, clearSearch } = useFriendStore();
  const { openDirectChat } = useChatStore();
  const user = useAuthStore((s) => s.user);

  const openChatWindow = (roomId: string, title?: string) => {
    const t = title ? `&title=${encodeURIComponent(title)}` : '';
    const url = `${window.location.origin}${window.location.pathname}?chatRoom=${roomId}${t}`;
    window.open(url, `chat-${roomId}`, 'width=400,height=650,resizable=yes');
  };
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileTarget, setProfileTarget] = useState<{ user: ProfileUser; isOwn: boolean } | null>(null);
  const friendIds = new Set(friends.map((f) => f.id));
  const { toast, show: showToast } = useToast();

  useEffect(() => { loadFriends(); }, []);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { clearSearch(); return; }
    setLoading(true);
    try { await searchUsers(q); } finally { setLoading(false); }
  };

  const handleClose = () => { setShowAdd(false); setQuery(''); clearSearch(); };

  const handleAdd = async (userId: string, name: string) => {
    try {
      await addFriend(userId);
      handleClose();
      showToast(`${name}님을 친구로 추가했습니다.`, 'success');
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? '친구 추가에 실패했습니다.', 'error');
    }
  };

  const handleDoubleClick = async (friendId: string, friendName: string) => {
    try {
      const roomId = await openDirectChat(friendId);
      openChatWindow(roomId, friendName);
    } catch {
      showToast('채팅방을 열 수 없습니다.', 'error');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {profileTarget && (
        <ProfileDetailPage
          profileUser={profileTarget.user}
          isOwn={profileTarget.isOwn}
          onClose={() => setProfileTarget(null)}
        />
      )}
      {/* 상단 토스트 */}
      {toast && (
        <div className="toast-anim" style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#e6f9ee' : '#fff0f0',
          color: toast.type === 'success' ? '#1a7a3c' : '#c0392b',
          borderRadius: 8, padding: '10px 20px', zIndex: 1000, fontSize: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      {/* 친구 목록 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <span style={{ fontWeight: 'bold', fontSize: 15 }}>친구 {friends.length}</span>
        <button
          onClick={() => setShowAdd(true)}
          style={{ width: 30, height: 30, borderRadius: 15, border: 'none', background: '#f0f0f0', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >+</button>
      </div>

      {/* 내 프로필 */}
      {user && (
        <div
          onClick={() => setProfileTarget({ user: { id: user.id, displayName: user.displayName, email: user.email, avatar: user.avatar, backgroundImage: user.backgroundImage }, isOwn: true })}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 24, flexShrink: 0,
            background: user.avatar ? 'transparent' : '#FEE500',
            backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20,
          }}>
            {!user.avatar && (user.displayName?.[0] ?? '?')}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 15 }}>{user.displayName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{user.email}</div>
          </div>
        </div>
      )}

      {/* 친구 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }}>
        {friends.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>친구를 추가해보세요!</p>}
        {friends.map((f) => {
          const isSelected = selectedId === f.id;
          return (
            <div
              key={f.id}
              className="list-item"
              onClick={() => setSelectedId(isSelected ? null : f.id)}
              onDoubleClick={() => handleDoubleClick(f.id, f.displayName)}
              style={{
                display: 'flex', alignItems: 'center', padding: '8px',
                borderRadius: 8, cursor: 'pointer', userSelect: 'none',
                background: isSelected ? '#FFF9C4' : 'transparent',
                outline: isSelected ? '2px solid #FEE500' : 'none',
              }}
            >
              <div
                onClick={(e) => { e.stopPropagation(); setProfileTarget({ user: { id: f.id, displayName: f.displayName, email: f.email, avatar: f.avatar, backgroundImage: f.backgroundImage }, isOwn: false }); }}
                style={{
                  width: 42, height: 42, borderRadius: 21, flexShrink: 0,
                  background: f.avatar ? 'transparent' : (isSelected ? '#F5CC00' : '#FEE500'),
                  backgroundImage: f.avatar ? `url(${f.avatar})` : undefined,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, fontWeight: 'bold', fontSize: 18,
                }}
              >
                {!f.avatar && (f.displayName?.[0] ?? '?')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{f.displayName}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{f.email}</div>
              </div>
              {isSelected && (
                <div style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>더블클릭으로 채팅</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 친구 추가 패널 (오버레이) */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={handleClose}>
          <div style={{ background: '#fff', borderRadius: 12, width: 400, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            {/* 패널 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #eee' }}>
              <div style={{ width: 32 }} />
              <span style={{ fontWeight: 600, fontSize: 16 }}>친구 추가</span>
              <button onClick={handleClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#555', lineHeight: 1, padding: '0 4px' }}>✕</button>
            </div>

            {/* 검색 입력 */}
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 8, padding: '8px 12px', gap: 8 }}>
                <span>🔍</span>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="닉네임 또는 이메일 검색"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14 }}
                />
                {query && <button onClick={() => { setQuery(''); clearSearch(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#aaa' }}>✕</button>}
              </div>
            </div>

            {/* 검색 결과 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
              {loading && <p style={{ color: '#aaa', textAlign: 'center' }}>검색 중...</p>}
              {!loading && query && searchResults.length === 0 && <p style={{ color: '#aaa', textAlign: 'center' }}>검색 결과가 없습니다.</p>}
              {searchResults.map((u) => {
                const isAdded = friendIds.has(u.id);
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 21, background: '#FEE500', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, fontWeight: 'bold', fontSize: 18, flexShrink: 0 }}>
                      {u.displayName?.[0] ?? '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                      <div style={{ color: '#888', fontSize: 12 }}>{u.email}</div>
                    </div>
                    <button
                      onClick={() => !isAdded && handleAdd(u.id, u.displayName)}
                      disabled={isAdded}
                      style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: isAdded ? '#e8e8e8' : '#FEE500', cursor: isAdded ? 'default' : 'pointer', fontWeight: 600, fontSize: 13, color: isAdded ? '#999' : '#111' }}
                    >
                      {isAdded ? '추가됨' : '친구 추가'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
