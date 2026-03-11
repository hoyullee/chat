export type MessageType = 'text' | 'emoticon' | 'image';
export interface Message { id: string; roomId: string; senderId: string; content: string; type: MessageType; isRead: boolean; createdAt: string; }
export interface ChatRoom { id: string; name?: string; type: 'direct' | 'group'; participantIds: string[]; createdAt: string; }
export interface SendMessagePayload { roomId: string; content: string; type: MessageType; senderId: string; }
export interface SocketEvents {
  'join-room': { roomId: string };
  'leave-room': { roomId: string };
  'send-message': SendMessagePayload;
  'receive-message': Message;
  'typing': { roomId: string; userId: string; isTyping: boolean };
  'read-message': { messageId: string; userId: string };
  'read-receipt': { messageId: string; userId: string };
  'user-online': { userId: string; online: boolean };
}
