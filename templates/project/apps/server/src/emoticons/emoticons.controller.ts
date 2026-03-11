import { Controller, Get, UseGuards } from '@nestjs/common';
import { EmoticonsService } from './emoticons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('emoticons')
@UseGuards(JwtAuthGuard)
export class EmoticonsController {
  constructor(private readonly emoticonsService: EmoticonsService) {}

  @Get('packs')
  getPacks() {
    return this.emoticonsService.getPacks();
  }
}
