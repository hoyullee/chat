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

  const openChatWindow = (roomId: string) => {
    onRoomClear?.();
    const url = `${window.location.origin}${window.location.pathname}?chatRoom=${roomId}`;
    window.open(url, `chat-${roomId}`, 'width=400,height=650,resizable=yes');
  };

  return (
    <div>
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
            onClick={() => setSelectedRoomId(room.id)}
            onDoubleClick={() => openChatWindow(room.id)}
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
  );
}
