import { Body, Controller, Get, Inject, Param, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './services/user.service';
import { UpdateProfileDto } from './dtos/updateProfile.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        @Inject(UserService) private userService: UserService
    ) { }

    @Get('/rides/me')
    async getMyRides(@User('sub') userId: string) {
        return this.userService.getMyRides(userId);
    }

    @Get('/profile/me')
    async getMyProfile(@User('sub') userId: string, @Req() req: Request) {
        return this.userService.getMyProfile(userId);
    }

    @Patch('/profile/me')
    async updateMyProfile(@User('sub') userId: string, @Body() updateProfileDto: Partial<UpdateProfileDto>) {
        return this.userService.updateProfile(userId, updateProfileDto);
    }

    @Get('/profile/:userId')
    async getUserProfile(@Param('userId') id: string) {
        return this.userService.getProfile(id);
    }

    @Patch('/profile/:userId')
    async updateUserProfile(@Param('userId') id: string, @Body() updateProfileDto: Partial<UpdateProfileDto>) {
        return this.userService.updateProfile(id, updateProfileDto);
    }
}
