import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { EmoticonsModule } from './emoticons/emoticons.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () =>
        process.env.DATABASE_URL
          ? {
              type: 'postgres' as const,
              url: process.env.DATABASE_URL,
              autoLoadEntities: true,
              synchronize: process.env.NODE_ENV !== 'production',
            }
          : {
              type: 'better-sqlite3' as const,
              database: 'dev.sqlite',
              autoLoadEntities: true,
              synchronize: true,
            },
    }),
    AuthModule,
    UsersModule,
    FriendsModule,
    ChatModule,
    EmoticonsModule,
  ],
})
export class AppModule {}
