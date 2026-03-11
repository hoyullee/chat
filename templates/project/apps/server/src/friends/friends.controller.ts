import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FriendStatus } from './friend.entity';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  getFriends(@Req() req: any) {
    return this.friendsService.getFriends(req.user.sub);
  }

  @Post('request')
  sendRequest(@Req() req: any, @Body('addresseeId') addresseeId: string) {
    return this.friendsService.sendRequest(req.user.sub, addresseeId);
  }

  @Patch(':id')
  updateStatus(@Req() req: any, @Param('id') id: string, @Body('status') status: FriendStatus) {
    return this.friendsService.updateStatus(id, req.user.sub, status);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.friendsService.remove(id, req.user.sub);
  }
}
