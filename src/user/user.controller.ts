import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './services/user.services';
import { UpdateProfileDto } from './dtos/updateProfile.dto';
@Controller('user')
export class UserController {
    constructor(
        @Inject(UserService) private userService: UserService
    ) {}
    @Get('/profile/me')
    async getMyProfile(@Req() req:Request){
        return this.userService.getMyProfile();
    }

    @Get('/profile/:userId')
    async getUserProfile(@Param('userId') id: string){
        return this.userService.getProfile(id);
    }

    @Patch('/profile/:userId')
    async updateUserProfile(@Param('userId') id: string,@Body() updateProfileDto: Partial<UpdateProfileDto>) {
        return this.userService.updateProfile(id,updateProfileDto);
    }
}
