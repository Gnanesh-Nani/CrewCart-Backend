export class LocationBroadcastDto {
  rideId: string;
  userId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  clientTs: number;        // original client timestamp
  serverTs: number;        // server receive timestamp
  seq: number;
  isStale: boolean;        // if > 10s old
}