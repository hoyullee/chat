import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';

export enum RoomType {
  DIRECT = 'direct',
  GROUP = 'group',
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'varchar', default: RoomType.DIRECT })
  type: RoomType;

  @Column('simple-array')
  participantIds: string[];

  @CreateDateColumn()
  createdAt: Date;
}
