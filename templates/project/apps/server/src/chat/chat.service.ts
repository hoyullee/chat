import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly roomRepo: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  getRooms(userId: string) {
    return this.roomRepo
      .createQueryBuilder('room')
      .where(':userId = ANY(room.participantIds)', { userId })
      .orderBy('room.createdAt', 'DESC')
      .getMany();
  }

  getMessages(roomId: string, limit = 50) {
    return this.messageRepo.find({
      where: { roomId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  saveMessage(data: Partial<Message>): Promise<Message> {
    return this.messageRepo.save(data);
  }

  async getOrCreateDirectRoom(userId1: string, userId2: string): Promise<ChatRoom> {
    const existing = await this.roomRepo
      .createQueryBuilder('room')
      .where('room.type = :type', { type: 'direct' })
      .andWhere(':u1 = ANY(room.participantIds)', { u1: userId1 })
      .andWhere(':u2 = ANY(room.participantIds)', { u2: userId2 })
      .getOne();
    if (existing) return existing;
    return this.roomRepo.save({ type: 'direct', participantIds: [userId1, userId2] });
  }
}
