import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
import { ChatRoom, RoomType } from './chat-room.entity';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly roomRepo: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getRooms(userId: string) {
    const rooms = await this.roomRepo
      .createQueryBuilder('room')
      .where("(',' || room.participantIds || ',') LIKE :pattern", { pattern: `%,${userId},%` })
      .orderBy('room.createdAt', 'DESC')
      .getMany();

    return Promise.all(rooms.map(async (room) => {
      let otherUser: { id: string; displayName: string; avatar?: string } | null = null;
      if (room.type === RoomType.DIRECT) {
        const otherId = room.participantIds.find((id) => id !== userId);
        if (otherId) {
          const user = await this.userRepo.findOne({ where: { id: otherId } });
          if (user) otherUser = { id: user.id, displayName: user.displayName, avatar: user.avatar };
        }
      }

      const lastMsg = await this.messageRepo.findOne({
        where: { roomId: room.id },
        order: { createdAt: 'DESC' },
      });

      return { ...room, otherUser, lastMessage: lastMsg?.content ?? null };
    }));
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
