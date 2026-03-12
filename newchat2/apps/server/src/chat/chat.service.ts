import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
import { ChatRoom, RoomType } from './chat-room.entity';
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
      .where("(',' || room.participantIds || ',') LIKE :pattern", { pattern: `%,${userId},%` })
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

  async markMessagesRead(roomId: string, readerId: string): Promise<string[]> {
    const unread = await this.messageRepo.find({
      where: { roomId, isRead: false, senderId: Not(readerId) },
    });
    if (!unread.length) return [];
    await this.messageRepo.update(
      { id: In(unread.map((m) => m.id)) },
      { isRead: true },
    );
    return unread.map((m) => m.id);
  }

  async getOrCreateDirectRoom(userId1: string, userId2: string): Promise<ChatRoom> {
    const existing = await this.roomRepo
      .createQueryBuilder('room')
      .where('room.type = :type', { type: RoomType.DIRECT })
      .andWhere("(',' || room.participantIds || ',') LIKE :p1", { p1: `%,${userId1},%` })
      .andWhere("(',' || room.participantIds || ',') LIKE :p2", { p2: `%,${userId2},%` })
      .getOne();
    if (existing) return existing;
    return this.roomRepo.save({ type: RoomType.DIRECT, participantIds: [userId1, userId2] });
  }
}
