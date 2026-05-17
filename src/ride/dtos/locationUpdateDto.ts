export class LocationUpdateDto {
  rideId: string;
  userId: string;           // from JWT token (server-trusted)
  latitude: number;              // -90 to 90
  longitude: number;              // -180 to 180
  speed?: number;           // m/s
  heading?: number;         // 0-360 degrees
  accuracy?: number;        // meters
  clientTs: number;         // client timestamp (ms)
  seq: number;              // monotonic per user
}