import { Module } from '@nestjs/common';
import { EmoticonsController } from './emoticons.controller';
import { EmoticonsService } from './emoticons.service';

@Module({
  controllers: [EmoticonsController],
  providers: [EmoticonsService],
})
export class EmoticonsModule {}
