import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  getRooms(@Req() req: any) {
    return this.chatService.getRooms(req.user.sub);
  }

  @Post('rooms/direct')
  getOrCreateDirect(@Req() req: any, @Body('targetUserId') targetUserId: string) {
    return this.chatService.getOrCreateDirectRoom(req.user.sub, targetUserId);
  }

  @Get('rooms/:id/messages')
  getMessages(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.chatService.getMessages(id, limit ? parseInt(limit) : 50);
  }

  @Post('rooms/:id/messages')
  sendMessage(@Param('id') roomId: string, @Req() req: any, @Body() body: { content: string; type?: string }) {
    return this.chatService.saveMessage({ roomId, content: body.content, type: (body.type ?? 'text') as any, senderId: req.user.sub });
  }
}
