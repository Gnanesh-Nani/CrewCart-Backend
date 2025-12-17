import { IsString, IsUrl } from "class-validator";

export class UpdateProfileDto {
    @IsString()
    fullName: string;
    
    @IsUrl()
    avatarUrl: string;
    
    @IsString()
    bikeModel: string;
    
    @IsString()
    bikeNumber: string;
    
    @IsString()
    bio: string;
}