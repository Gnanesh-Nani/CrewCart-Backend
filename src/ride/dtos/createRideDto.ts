import { Type } from "class-transformer";
import { IsDate, IsEnum, IsISO31661Alpha2, IsNotEmpty, IsString } from "class-validator";
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
}