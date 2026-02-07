import type { LineString } from "geojson";
import { RideStatus } from "src/common/enums/ride-status.enum";
import { RideVisibility } from "src/common/enums/ride-types.enum";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

@Entity('rides')
export class Ride {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'bigint', name: 'creator_id' })
    creatorId: string;

    @Column({ type: 'enum', enum: RideVisibility, name: 'visibility' })
    visibility: string;

    @Column({ type: 'bigint', name: 'crew_id', default: null })
    crewId: string;

    @Column({ type: 'enum', enum: RideStatus, default: RideStatus.CREATED, name: 'ride_status' })
    rideStatus: RideStatus;

    @Column({ name: 'start_time', type: 'timestamp' })
    startTime: Date;

    @Column({ name: 'end_time', type: 'timestamp' })
    endTime: Date;

    @Index('IDX_ride_route', { spatial: true })
    @Column({
        type: 'geography',
        spatialFeatureType: 'LineString',
        srid: 4326,
        name: 'route_path',
        nullable:true
    })
    routePath: LineString;

    @Column({
        type: 'integer',
        name: 'distance_meters',
        nullable: true
    })
    distanceMeters: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
