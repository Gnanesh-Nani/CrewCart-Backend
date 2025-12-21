import { WaypointTypes } from "src/common/enums/waypoint-types.enum";
import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('ride_waypoints')
export class Waypoint {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'ride_id', type: 'bigint' })
  rideId: string;

  @Column({
    type: 'enum',
    enum: WaypointTypes,
  })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: string;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;
}
