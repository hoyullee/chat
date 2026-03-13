import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRoom } from './chat-room.entity';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, Message, User])],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
