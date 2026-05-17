import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { LocationUpdateDto } from '../dtos/locationUpdateDto';
import { LocationBroadcastDto } from '../dtos/locationBroadcastDto';

@Injectable()
export class LocationService {
  constructor(private redisService: RedisService) {}

  /**
   * Store latest location in Redis
   */
  async updateMemberLocation(
    rideId: string,
    userId: string,
    payload: LocationUpdateDto,
  ) {
    const key = `ride:${rideId}:loc:${userId}`;
    const serverTs = Date.now();

    await this.redisService.hSetEx(
      key,
      {
        latitude: payload.latitude,
        longitude: payload.longitude,
        speed: payload.speed ?? null,
        heading: payload.heading ?? null,
        accuracy: payload.accuracy ?? null,
        clientTs: payload.clientTs,
        serverTs: serverTs,
        seq: payload.seq,
      },
      60, // TTL 60s
    );

    // Also add to short-term history (optional)
    await this.appendLocationHistory(rideId, userId, payload, serverTs);
  }

  /**
   * Get current location for a user in a ride
   */
  async getMemberLocation(rideId: string,userId: string) {
    const key = `ride:${rideId}:loc:${userId}`;
    const data = await this.redisService.hGetAll(key);
    Logger.debug(key,data);
    if (!data || !data.latitude) return null;

    const serverTs = parseInt(data.serverTs, 10);
    const clientTs = parseInt(data.clientTs, 10);
    const now = Date.now();
    const isStale = now - serverTs > 10000; 

    return {
      rideId,
      userId,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      speed: data.speed ? parseFloat(data.speed) : undefined,
      heading: data.heading ? parseFloat(data.heading) : undefined,
      accuracy: data.accuracy ? parseFloat(data.accuracy) : undefined,
      clientTs,
      serverTs,
      seq: parseInt(data.seq, 10),
      isStale,
    };
  }

  /**
   * Get all member locations in a ride
   */
  async getAllMemberLocations(rideId: string) {
    const members = await this.redisService.sMembers(`ride:${rideId}:members`);
    Logger.debug("all members", members);
    const locations: LocationBroadcastDto[] = [];

    for (const userId of members) {
      const loc = await this.getMemberLocation(rideId, userId);
      Logger.debug(loc)
      if (loc) locations.push(loc);
    }
    
    Logger.debug(locations)
    return locations;
  }

  /**
   * Store location in history stream (optional)
   */
  private async appendLocationHistory(rideId: string,userId: string,payload: any,serverTs: number) {
    const key = `ride:${rideId}:track:${userId}`;
    const entry = JSON.stringify({
      latitude: payload.latitude,
      longitude: payload.longitude,
      clientTs: payload.clientTs,
      serverTs: serverTs,
    });

    // Using LPUSH + LTRIM for max length
    await this.redisService.lPush(key, entry);
    await this.redisService.expire(key, 3600); // 1 hour TTL
    await this.redisService.lTrim(key, 0, 99); // Keep last 100
  }

  /**
   * Check if location is valid (sanity checks)
   */
  validateLocation(payload: any): { valid: boolean; error?: string } {
    if (!payload.latitude || !payload.longitude) {
      return { valid: false, error: 'Missing latitude/longitude' };
    }

    if (payload.latitude < -90 || payload.longitude > 90) {
      return { valid: false, error: 'Invalid latitude' };
    }

    if (payload.longitude < -180 || payload.longitude > 180) {
      return { valid: false, error: 'Invalid longitude' };
    }

    if (payload.speed && payload.speed > 150) {
      // > 540 km/h - impossible for vehicle
      return { valid: false, error: 'Speed impossible' };
    }

    return { valid: true };
  }
}