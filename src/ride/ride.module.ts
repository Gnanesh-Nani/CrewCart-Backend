import { Module } from '@nestjs/common';
import { RideController } from './controllers/ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './entities/ride.entity';
import { Waypoint } from './entities/waypoint.entity';
import { RideMember } from './entities/ride-members.entity';
import { RideService } from './services/ride.service';
import { WaypointController } from './controllers/way-point.controller';
import { WaypointService } from './services/waypoint.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ride,Waypoint,RideMember])],
  providers: [RideService,WaypointService],
  controllers: [RideController,WaypointController]
})
export class RideModule {}
