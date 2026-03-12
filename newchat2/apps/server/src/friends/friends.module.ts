import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { Friend } from './friend.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User])],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
