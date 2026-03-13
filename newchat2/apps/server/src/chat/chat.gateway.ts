import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.set(userId, client.id);
      this.server.emit('user-online', { userId, online: true });
    }
  }

  handleDisconnect(client: Socket) {
    const entry = [...this.onlineUsers.entries()].find(([, sid]) => sid === client.id);
    if (entry) {
      this.onlineUsers.delete(entry[0]);
      this.server.emit('user-online', { userId: entry[0], online: false });
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.roomId);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.roomId);
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() data: { roomId: string; [key: string]: any },
    @ConnectedSocket() client: Socket,
  ) {
    // 저장은 HTTP API에서 처리, 여기서는 실시간 브로드캐스트만
    client.to(data.roomId).emit('receive-message', data);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('typing', data);
  }

  @SubscribeMessage('read-message')
  async handleReadMessage(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const messageIds = await this.chatService.markMessagesRead(data.roomId, data.userId);
    if (messageIds.length > 0) {
      this.server.to(data.roomId).emit('read-receipt', { roomId: data.roomId, messageIds });
    }
  }
}
