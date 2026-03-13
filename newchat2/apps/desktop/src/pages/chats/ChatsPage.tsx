import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';

interface Props {
  initialRoomId?: string | null;
  onRoomClear?: () => void;
}

export function ChatsPage({ initialRoomId, onRoomClear }: Props) {
  const { rooms, loadRooms } = useChatStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    if (initialRoomId) openChatWindow(initialRoomId);
  }, [initialRoomId]);

  const openChatWindow = (roomId: string, title?: string) => {
    onRoomClear?.();
    const t = title ? `&title=${encodeURIComponent(title)}` : '';
    const url = `${window.location.origin}${window.location.pathname}?chatRoom=${roomId}${t}`;
    window.open(url, `chat-${roomId}`, 'width=400,height=650,resizable=yes');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 채팅 목록 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <span style={{ fontWeight: 'bold', fontSize: 15 }}>채팅 {rooms.length}</span>
        <div style={{ width: 30, height: 30 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
      {rooms.length === 0 && (
        <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>채팅방이 없습니다.</p>
      )}
      {rooms.map((room) => {
        const friendName = room.otherUser?.displayName ?? room.name ?? '채팅방';
        const avatarLetter = friendName[0]?.toUpperCase() ?? '#';
        const isSelected = selectedRoomId === room.id;

        return (
          <div
            key={room.id}
            className="list-item"
            onClick={() => setSelectedRoomId(room.id)}
            onDoubleClick={() => openChatWindow(room.id, friendName)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              background: isSelected ? '#e8f4fd' : 'transparent',
              userSelect: 'none',
            }}
          >
            {/* 프로필 아이콘 */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: '#FEE500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              fontWeight: 'bold',
              fontSize: 18,
              flexShrink: 0,
            }}>
              {avatarLetter}
            </div>

            {/* 이름 + 최신 메시지 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{friendName}</div>
              <div style={{
                fontSize: 13,
                color: '#888',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {room.lastMessage ?? ''}
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
