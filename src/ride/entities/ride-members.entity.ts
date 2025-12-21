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

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
