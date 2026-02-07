import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
import type { LineString } from "geojson";
import { RideVisibility } from "src/common/enums/ride-types.enum";

export class CreateRideDto {
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(RideVisibility)
    visibility: RideVisibility;

    @IsNotEmpty()
    @Type(() => Date)
    startTime: Date;

    @IsNotEmpty()
    @Type(() => Date)
    endTime: Date;

    @IsNotEmpty()
    @IsNumber()
    distanceMeters: number;

    @IsNotEmpty()
    @IsObject()
    routePath: LineString;

}