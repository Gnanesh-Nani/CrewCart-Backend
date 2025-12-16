import { IsString,IsNotEmpty,MinLength,IsEmail,IsPhoneNumber,MaxLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    fullName: string;
}