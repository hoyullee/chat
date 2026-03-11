import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';

interface Props { roomId: string; onBack: () => void; }

export function ChatRoom({ roomId, onBack }: Props) {
  const { messages, loadMessages, addMessage } = useChatStore();
  const socket = useSocket();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages(roomId);
    socket.emit('join-room', { roomId });
    socket.on('receive-message', (msg: any) => {
      addMessage(roomId, msg);
    });
    return () => { socket.emit('leave-room', { roomId }); socket.off('receive-message'); };
  }, [roomId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages[roomId]]);

  const send = () => {
    if (!text.trim()) return;
    socket.emit('send-message', { roomId, content: text, type: 'text' });
    setText('');
  };

  const roomMessages = messages[roomId] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={onBack}>← 뒤로</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#b2c7d9' }}>
        {roomMessages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.isMine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: 12, background: msg.isMine ? '#FEE500' : '#fff' }}>
              {msg.type === 'emoticon' ? <span style={{ fontSize: 32 }}>{msg.content}</span> : <span>{msg.content}</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', padding: 8, background: '#fff', borderTop: '1px solid #eee', gap: 8 }}>
        <input
          style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid #ddd', fontSize: 14 }}
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="메시지 입력..."
        />
        <button onClick={send} style={{ padding: '8px 16px', background: '#FEE500', border: 'none', borderRadius: 20, fontWeight: 'bold', cursor: 'pointer' }}>전송</button>
      </div>
    </div>
  );
}
