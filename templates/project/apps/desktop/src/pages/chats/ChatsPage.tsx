import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { ChatRoom } from './ChatRoom';

export function ChatsPage() {
  const { rooms, loadRooms } = useChatStore();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => { loadRooms(); }, []);

  if (activeRoomId) {
    return <ChatRoom roomId={activeRoomId} onBack={() => setActiveRoomId(null)} />;
  }

  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id} onClick={() => setActiveRoomId(room.id)}
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
