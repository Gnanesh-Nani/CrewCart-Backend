import { RideMemberStatus } from "src/common/enums/ride-member-status.enum";
import { RiderRoles } from "src/common/enums/rider-roles.enum";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('ride_members')
@Index(['rideId', 'userId'], { unique: true })
export class RideMember {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'ride_id', type: 'bigint' })
  rideId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({
    type: 'enum',
    enum: RiderRoles
  })
  role: string;

  @Column({
    type: 'enum',
    enum: RideMemberStatus,
    default: RideMemberStatus.JOINED
  })
  status: string;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'joined_at' , type: 'timestamp'})
  joinedAt: Date ;
}
