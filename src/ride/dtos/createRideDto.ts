import { Type } from "class-transformer";
import { IsDate, IsEnum, IsISO31661Alpha2, IsNotEmpty, IsString } from "class-validator";
import { RideVisiblity } from "src/common/enums/ride-types.enum";

export class CreateRideDto {
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(RideVisiblity)
    visiblity: RideVisiblity;

    @IsNotEmpty()
    @Type(() => Date)
    startTime: Date;

    @IsNotEmpty()
    @Type(() => Date)
    endTime: Date;
}