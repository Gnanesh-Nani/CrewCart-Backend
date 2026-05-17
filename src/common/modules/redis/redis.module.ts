import { Module } from '@nestjs/common';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

@Module({
  imports: [
    IoRedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
      options: {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}