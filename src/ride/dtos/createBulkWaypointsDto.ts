import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateWaypointDto } from './createWaypointDto';

export class CreateBulkWaypointsDto {

  @IsArray()
  @ArrayMinSize(2) 
  @ValidateNested({ each: true })
  @Type(() => CreateWaypointDto)
  waypoints: CreateWaypointDto[];
}
