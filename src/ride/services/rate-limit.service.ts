// src/ride/services/rate-limit.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/modules/redis/redis.service';

@Injectable()
export class RateLimitService {
  private readonly MAX_LOCATION_UPDATES_PER_SECOND = 5;

  constructor(private redisService: RedisService) {}

  /**
   * Check if user exceeded location update rate limit
   */
  async isRateLimited(userId: string): Promise<boolean> {
    const key = `ratelimit:location:${userId}`;
    const current = await this.redisService.incr(key);

    if (current === 1) {
      await this.redisService.expire(key, 5); // Reset every second
    }

    return current > this.MAX_LOCATION_UPDATES_PER_SECOND;
  }
}