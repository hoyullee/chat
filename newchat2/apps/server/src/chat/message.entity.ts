import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum MessageType {
  TEXT = 'text',
  EMOTICON = 'emoticon',
  IMAGE = 'image',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  roomId: string;

  @Column()
  senderId: string;

  @Column()
  content: string;

  @Column({ type: 'varchar', default: MessageType.TEXT })
  type: MessageType;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
