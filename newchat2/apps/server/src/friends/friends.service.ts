import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend, FriendStatus } from './friend.entity';
import { User } from '../users/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getFriends(userId: string): Promise<{ id: string; displayName: string; email: string; avatar: string }[]> {
    const rows = await this.friendRepo.find({
      where: [
        { requesterId: userId, status: FriendStatus.ACCEPTED },
        { addresseeId: userId, status: FriendStatus.ACCEPTED },
      ],
    });
    const otherIds = rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
    if (otherIds.length === 0) return [];
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.id IN (:...ids)', { ids: otherIds })
      .select(['u.id', 'u.displayName', 'u.email', 'u.avatar'])
      .getMany();
    return users.map((u) => ({ id: u.id, displayName: u.displayName, email: u.email, avatar: u.avatar }));
  }

  async sendRequest(requesterId: string, addresseeId: string) {
    const existing = await this.friendRepo.findOne({
      where: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    });
    if (existing) {
      if (existing.status === FriendStatus.ACCEPTED) {
        throw new ConflictException('이미 친구입니다.');
      }
      // PENDING 상태인 경우 ACCEPTED로 업그레이드
      await this.friendRepo.update(existing.id, { status: FriendStatus.ACCEPTED });
      return;
    }
    return this.friendRepo.save({ requesterId, addresseeId, status: FriendStatus.ACCEPTED });
  }

  async updateStatus(id: string, userId: string, status: FriendStatus) {
    await this.friendRepo.update({ id, addresseeId: userId }, { status });
    return this.friendRepo.findOne({ where: { id } });
  }

  async remove(id: string, userId: string) {
    await this.friendRepo.delete({ id, requesterId: userId });
  }
}
