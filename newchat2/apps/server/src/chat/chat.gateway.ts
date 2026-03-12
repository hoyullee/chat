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
import { MessageType } from './message.entity';

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
  async handleMessage(
    @MessageBody() data: { roomId: string; content: string; type: MessageType; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.saveMessage(data);
    this.server.to(data.roomId).emit('receive-message', message);
    return message;
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
