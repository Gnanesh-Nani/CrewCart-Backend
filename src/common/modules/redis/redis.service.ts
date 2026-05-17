import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private redis: Redis) {}

  // ===== Hash Operations =====
  async hSetEx(key: string,value: Record<string, any>,ttl: number,){
    const pipeline = this.redis.pipeline();
    const entries = Object.entries(value)
      .map(([k, v]) => [k, JSON.stringify(v)])
      .flat();
    
    pipeline.hset(key, ...entries);
    pipeline.expire(key, ttl);
    await pipeline.exec();
  }

  async hGetAll(key: string) {
    return this.redis.hgetall(key);
  }

  async hSet(key: string,field: string,value: any,) {
    return this.redis.hset(key, field, JSON.stringify(value));
  }

  async hGet(key: string, field: string) {
    return this.redis.hget(key, field);
  }

  // ===== Set Operations =====
  async sAdd(key: string, ...members: string[]){
    return this.redis.sadd(key, ...members);
  }

  async sRem(key: string, ...members: string[]){
    return this.redis.srem(key, ...members);
  }

  async sMembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async sIsMember(key: string, member: string) {
    return this.redis.sismember(key, member);
  }

  // ===== String Operations =====
  async setEx(key: string, value: string, ttl: number) {
    await this.redis.setex(key, ttl, value);
  }

  async set(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value));
  }

  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async getString(key: string) {
    return this.redis.get(key);
  }

  // ===== Counter Operations =====
  async incr(key: string) {
    return this.redis.incr(key);
  }

  async incrBy(key: string, increment: number): Promise<number> {
    return this.redis.incrby(key, increment);
  }

  async decr(key: string): Promise<number> {
    return this.redis.decr(key);
  }

  // ===== Expiry Operations =====
  async expire(key: string, ttl: number): Promise<number> {
    return this.redis.expire(key, ttl);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  // ===== General Operations =====
  async del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async flushAll(): Promise<void> {
    await this.redis.flushall();
  }

  // ===== List Operations =====
  async lPush(key: string, ...values: string[]): Promise<number> {
    return this.redis.lpush(key, ...values);
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.lrange(key, start, stop);
  }

  async lTrim(key: string, start: number, stop: number): Promise<void> {
    await this.redis.ltrim(key, start, stop);
  }

  async lLen(key: string): Promise<number> {
    return this.redis.llen(key);
  }

  // ===== Pub/Sub Operations =====
  async publish(channel: string, message: any): Promise<number> {
    return this.redis.publish(channel, JSON.stringify(message));
  }

  subscribe(channel: string, callback: (message: any) => void): void {
    const subscriber = this.redis.duplicate();
    subscriber.subscribe(channel, (err) => {
      if (err) console.error('Failed to subscribe:', err);
    });
    subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          callback(JSON.parse(msg));
        } catch (e) {
          callback(msg);
        }
      }
    });
  }

  // ===== Raw Redis Access =====
  getClient(): Redis {
    return this.redis;
  }
}