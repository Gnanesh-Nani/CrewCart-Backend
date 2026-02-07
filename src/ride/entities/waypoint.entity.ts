import { WaypointTypes } from "src/common/enums/waypoint-types.enum";
import type { Point } from "geojson";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

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

  @Index('IDX_waypoint_location', { spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;
}
