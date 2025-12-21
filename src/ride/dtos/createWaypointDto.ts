import { IsEnum, IsInt, IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';
import { WaypointTypes } from 'src/common/enums/waypoint-types.enum';

export class CreateWaypointDto {

  @IsEnum(WaypointTypes)
  type: WaypointTypes;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsInt()
  orderIndex: number;
}
