import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum FriendStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
}

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesterId: string;

  @Column()
  addresseeId: string;

  @Column({ type: 'varchar', default: FriendStatus.PENDING })
  status: FriendStatus;

  @CreateDateColumn()
  createdAt: Date;
}
