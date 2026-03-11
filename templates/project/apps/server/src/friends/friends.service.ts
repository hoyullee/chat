import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend, FriendStatus } from './friend.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
  ) {}

  getFriends(userId: string) {
    return this.friendRepo.find({
      where: [
        { requesterId: userId, status: FriendStatus.ACCEPTED },
        { addresseeId: userId, status: FriendStatus.ACCEPTED },
      ],
    });
  }

  sendRequest(requesterId: string, addresseeId: string) {
    return this.friendRepo.save({ requesterId, addresseeId, status: FriendStatus.PENDING });
  }

  async updateStatus(id: string, userId: string, status: FriendStatus) {
    await this.friendRepo.update({ id, addresseeId: userId }, { status });
    return this.friendRepo.findOne({ where: { id } });
  }

  async remove(id: string, userId: string) {
    await this.friendRepo.delete({ id, requesterId: userId });
  }
}
