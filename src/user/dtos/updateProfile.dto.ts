import { IsString, IsUrl } from "class-validator";

export class UpdateProfileDto {
    @IsString()
    fullName: string;
    
    @IsUrl()
    avatarUrl: string;
    
    @IsUrl()
    bannerUrl: string;

    @IsString()
    bikeModel: string;
    
    @IsString()
    bikeNumber: string;
    
    @IsString()
    bio: string;
}