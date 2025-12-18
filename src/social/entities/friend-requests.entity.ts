import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { RequestStatus } from 'src/common/enums/friend-request-status.enum';

@Entity('friend_requests')
@Index(['senderId', 'receiverId'], { unique: true })
export class FriendRequest {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: string;

  @Column({ name: 'receiver_id', type: 'bigint' })
  receiverId: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
