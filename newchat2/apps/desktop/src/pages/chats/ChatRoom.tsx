import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';

interface Props { roomId: string; }

export function ChatRoom({ roomId }: Props) {
  const { messages, loadMessages, addMessage, markRead } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages(roomId);
    socket.emit('join-room', { roomId });

    // 입장 시 미읽은 메시지 읽음 처리
    if (user?.id) {
      socket.emit('read-message', { roomId, userId: user.id });
    }

    socket.on('receive-message', (msg: any) => {
      addMessage(roomId, msg);
      // 상대방 메시지 수신 즉시 읽음 처리
      if (msg.senderId !== user?.id && user?.id) {
        socket.emit('read-message', { roomId, userId: user.id });
      }
    });

    socket.on('read-receipt', (data: { roomId: string; messageIds: string[] }) => {
      if (data.roomId === roomId) {
        markRead(roomId, data.messageIds);
      }
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('receive-message');
      socket.off('read-receipt');
    };
  }, [roomId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages[roomId]]);

  const send = () => {
    if (!text.trim() || !user?.id) return;
    socket.emit('send-message', { roomId, content: text, type: 'text', senderId: user.id });
    setText('');
  };

  const roomMessages = messages[roomId] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#b2c7d9' }}>
        {roomMessages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 8, alignItems: 'flex-end', gap: 4 }}>
              {isMine && (
                <div style={{ fontSize: 11, color: '#e8a000', fontWeight: 'bold', marginBottom: 2, alignSelf: 'flex-end' }}>
                  {!msg.isRead ? '1' : ''}
                </div>
              )}
              <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: 12, background: isMine ? '#FEE500' : '#fff' }}>
                {msg.type === 'emoticon' ? <span style={{ fontSize: 32 }}>{msg.content}</span> : <span>{msg.content}</span>}
              </div>
              {!isMine && (
                <div style={{ fontSize: 11, color: '#e8a000', fontWeight: 'bold', marginBottom: 2, alignSelf: 'flex-end' }}>
                  {!msg.isRead ? '1' : ''}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', padding: 8, background: '#fff', borderTop: '1px solid #eee', gap: 8 }}>
        <input
          style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid #ddd', fontSize: 14 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="메시지 입력..."
          autoFocus
        />
        <button onClick={send} style={{ padding: '8px 16px', background: '#FEE500', border: 'none', borderRadius: 20, fontWeight: 'bold', cursor: 'pointer' }}>전송</button>
      </div>
    </div>
  );
}
