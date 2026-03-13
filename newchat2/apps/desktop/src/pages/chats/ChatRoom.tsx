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
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const composingRef = useRef(false);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // effect 내부에서 생성해야 StrictMode double-invoke에서 올바르게 재생성됨
    broadcastRef.current = new BroadcastChannel('chat-updates');
    return () => {
      broadcastRef.current?.close();
      broadcastRef.current = null;
    };
  }, []);

  useEffect(() => {
    loadMessages(roomId);
    socket.emit('join-room', { roomId });

    // 입장 시 미읽은 메시지 읽음 처리
    if (user?.id) {
      socket.emit('read-message', { roomId, userId: user.id });
    }

    socket.on('receive-message', (msg: any) => {
      // 내가 보낸 메시지는 send()에서 이미 addMessage 처리 → 중복 방지
      if (msg.senderId === user?.id) return;
      addMessage(roomId, msg);
      broadcastRef.current?.postMessage({ type: 'new-message', roomId, content: msg.content });
      // 상대방 메시지 수신 즉시 읽음 처리
      if (user?.id) {
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

  useEffect(() => {
    if (!messages[roomId]?.length) return;
    const behavior = initialLoadRef.current ? 'instant' : 'smooth';
    initialLoadRef.current = false;
    bottomRef.current?.scrollIntoView({ behavior });
  }, [messages[roomId]]);

  const send = async () => {
    if (!text.trim() || !user?.id) return;
    const content = text;
    setText('');
    try {
      const { data: saved } = await api.post(`/chat/rooms/${roomId}/messages`, { content, type: 'text' });
      addMessage(roomId, saved);
      socket.emit('send-message', saved);
      broadcastRef.current?.postMessage({ type: 'new-message', roomId, content: saved.content });
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
      broadcastRef.current?.postMessage({ type: 'new-message', roomId, content: saved.content });
    } catch {}
  };

  const roomMessages = messages[roomId] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#b2c7d9' }}>
        {roomMessages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={isMine ? 'msg-mine' : 'msg-other'} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 8, alignItems: 'flex-end', gap: 4 }}>
              {isMine && (
                <div style={{ fontSize: 11, color: '#e8a000', fontWeight: 'bold', marginBottom: 2, alignSelf: 'flex-end' }}>
                  {!msg.isRead ? '1' : ''}
                </div>
              )}
              <div style={{ maxWidth: '70%', padding: '7px 11px', borderRadius: 12, background: isMine ? '#FEE500' : '#fff', fontSize: 13 }}>
                {msg.type === 'emoticon' ? <span style={{ fontSize: 26 }}>{msg.content}</span> : <span>{msg.content}</span>}
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
        <div className="emoticon-panel" style={{ display: 'flex', flexWrap: 'wrap', padding: 8, background: '#f9f9f9', borderTop: '1px solid #eee', gap: 4 }}>
          {['😀', '😂', '❤️', '👍', '😍', '🎉', '😭', '😊', '🔥', '✨', '🥰', '😎'].map((emoji) => (
            <button key={emoji} onClick={() => sendEmoticon(emoji)} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 }}>{emoji}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', padding: '10px 10px 10px 6px', background: '#fff', borderTop: '1px solid #eee', gap: 6, alignItems: 'flex-end' }}>
        {/* 이모지 버튼 */}
        <button
          className="chat-icon-btn"
          onClick={() => setShowEmoticons(!showEmoticons)}
          style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none',
            background: showEmoticons ? '#FFF3B0' : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18, flexShrink: 0, marginBottom: 2,
            transition: 'background 0.15s',
          }}
        >😊</button>

        {/* 텍스트 입력 */}
        <textarea
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 16,
            border: '1.5px solid #e0e0e0', fontSize: 13, resize: 'none',
            height: 66, lineHeight: '1.55', outline: 'none',
            fontFamily: 'inherit', overflowY: 'auto', background: '#fafafa',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#FEE500'; e.target.style.background = '#fff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.background = '#fafafa'; }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { setTimeout(() => { composingRef.current = false; }, 0); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !composingRef.current) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="메시지 입력..."
          autoFocus
        />

        {/* 전송 버튼 */}
        <button
          onClick={send}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: text.trim() ? '#FEE500' : '#f0f0f0',
            cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginBottom: 2, transition: 'background 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke={text.trim() ? '#3A1D1D' : '#bbb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={text.trim() ? '#3A1D1D' : '#bbb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
