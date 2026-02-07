import {Entity,PrimaryColumn,Column,OneToOne,JoinColumn,CreateDateColumn} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryColumn({ type: 'bigint', name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50, unique: true })
  userName: string;

  @Column({ type: 'varchar', length: 100, name: 'full_name', nullable: true })
  fullName: string;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', name: 'banner_url', nullable: true })
  bannerUrl: string;

  @Column({ type: 'varchar', length: 100, name: 'bike_model', nullable: true })
  bikeModel: string;

  @Column({ type: 'varchar', length: 50, name: 'bike_number', nullable: true })
  bikeNumber: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
