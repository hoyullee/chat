import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../services/api';

interface Props { roomId: string; }

export function ChatRoom({ roomId }: Props) {
  const { messages, loadMessages, addMessage, markRead } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();
  const [text, setText] = useState('');
  const [showEmoticons, setShowEmoticons] = useState(false);
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

  const send = async () => {
    if (!text.trim() || !user?.id) return;
    const content = text;
    setText('');
    try {
      const { data: saved } = await api.post(`/chat/rooms/${roomId}/messages`, { content, type: 'text' });
      addMessage(roomId, saved);
      socket.emit('send-message', saved); // 다른 사용자에게 실시간 브로드캐스트
    } catch {
      setText(content); // 오류 시 입력 복원
    }
  };

  const sendEmoticon = async (emoji: string) => {
    if (!user?.id) return;
    setShowEmoticons(false);
    try {
      const { data: saved } = await api.post(`/chat/rooms/${roomId}/messages`, { content: emoji, type: 'emoticon' });
      addMessage(roomId, saved);
      socket.emit('send-message', saved);
    } catch {}
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
      {showEmoticons && (
        <div style={{ display: 'flex', flexWrap: 'wrap', padding: 8, background: '#f9f9f9', borderTop: '1px solid #eee', gap: 4 }}>
          {['😀', '😂', '❤️', '👍', '😍', '🎉', '😭', '😊', '🔥', '✨', '🥰', '😎'].map((emoji) => (
            <button key={emoji} onClick={() => sendEmoticon(emoji)} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 }}>{emoji}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', padding: 8, background: '#fff', borderTop: '1px solid #eee', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setShowEmoticons(!showEmoticons)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>😊</button>
        <input
          style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid #ddd', fontSize: 14 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && (e.preventDefault(), send())}
          placeholder="메시지 입력..."
          autoFocus
        />
        <button onClick={send} style={{ padding: '8px 16px', background: '#FEE500', border: 'none', borderRadius: 20, fontWeight: 'bold', cursor: 'pointer' }}>전송</button>
      </div>
    </div>
  );
}
