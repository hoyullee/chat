import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';

interface Props {
  initialRoomId?: string | null;
  onRoomClear?: () => void;
}

export function ChatsPage({ initialRoomId, onRoomClear }: Props) {
  const { rooms, loadRooms, openDirectChat } = useChatStore();

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
      {rooms.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>채팅방이 없습니다.</p>}
      {rooms.map((room) => (
        <div key={room.id} onClick={() => openChatWindow(room.id)}
          style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            {room.name?.[0] ?? '#'}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{room.name || '채팅방'}</div>
            <div style={{ fontSize: 13, color: '#888' }}>{room.lastMessage || ''}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
