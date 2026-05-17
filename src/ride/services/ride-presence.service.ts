// src/ride/services/ride-presence.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/modules/redis/redis.service';

@Injectable()
export class RidePresenceService {
  constructor(private redisService: RedisService) {}

  /**
   * Add member to ride
   */
  async addMemberToRide(rideId: string, userId: string): Promise<void> {
    await this.redisService.sAdd(`ride:${rideId}:members`, userId);
    await this.redisService.sAdd(`ride:${rideId}:online`, userId);
  }

  /**
   * Remove member from ride
   */
  async removeMemberFromRide(rideId: string, userId: string): Promise<void> {
    await this.redisService.sRem(`ride:${rideId}:online`, userId);
    // Don't remove from :members, just mark offline
  }

  /**
   * Get online members in ride
   */
  async getOnlineMembers(rideId: string): Promise<string[]> {
    return this.redisService.sMembers(`ride:${rideId}:online`);
  }

  /**
   * Get all members in ride (including offline)
   */
  async getAllMembers(rideId: string): Promise<string[]> {
    return this.redisService.sMembers(`ride:${rideId}:members`);
  }

  /**
   * Map socket to user/ride for cleanup
   */
  async mapSocket(socketId: string, userId: string, rideId: string): Promise<void> {
    await this.redisService.setEx(`socket:${socketId}:user`, userId, 3600);
    await this.redisService.setEx(`socket:${socketId}:ride`, rideId, 3600);
  }

  /**
   * Cleanup socket mapping
   */
  async unmapSocket(socketId: string): Promise<void> {
    await this.redisService.del(`socket:${socketId}:user`);
    await this.redisService.del(`socket:${socketId}:ride`);
  }

  /**
   * Get user/ride from socket
   */
  async getSocketMapping(
    socketId: string,
  ): Promise<{ userId: string; rideId: string } | null> {
    const [userId, rideId] = await Promise.all([
      this.redisService.get(`socket:${socketId}:user`),
      this.redisService.get(`socket:${socketId}:ride`),
    ]);

    if (!userId || !rideId) return null;
    return { userId, rideId };
  }
}