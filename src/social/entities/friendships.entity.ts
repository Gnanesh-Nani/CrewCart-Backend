import { Entity, Column, CreateDateColumn, Index, PrimaryColumn } from 'typeorm';

@Entity('friends')
@Index(['userId', 'friendId'], { unique: true })
export class Friend {

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: string;

  @PrimaryColumn({ name: 'friend_id', type: 'bigint' })
  friendId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}