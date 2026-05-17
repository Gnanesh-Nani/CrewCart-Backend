import { Module } from '@nestjs/common';
import { RideController } from './controllers/ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './entities/ride.entity';
import { Waypoint } from './entities/waypoint.entity';
import { RideMember } from './entities/ride-members.entity';
import { RideService } from './services/ride.service';
import { WaypointController } from './controllers/way-point.controller';
import { WaypointService } from './services/waypoint.service';
import { RideGateway } from './gateways/ride.gateway';
import { LocationService } from './services/location.service';
import { RidePresenceService } from './services/ride-presence.service';
import { JwtModule } from '@nestjs/jwt';
import { RateLimitService } from './services/rate-limit.service';
import { RedisModule } from 'src/common/modules/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    JwtModule,
    TypeOrmModule.forFeature([Ride,Waypoint,RideMember])],
  providers: [
    RideGateway,
    LocationService,
    RidePresenceService,
    RideService,
    RateLimitService,
    WaypointService
  ],
  controllers: [RideController,WaypointController]
})
export class RideModule {}
