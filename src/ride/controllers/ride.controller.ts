import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateRideDto } from '../dtos/createRideDto';
import { RideService } from '../services/ride.service';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('ride')
@UseGuards(JwtAuthGuard)
export class RideController {
    constructor(
        @Inject() private rideService: RideService
    ) {}

    @Post()
    async createRide(@User('sub') userId: string,@Body() createRideDto: CreateRideDto) {
        return this.rideService.createRide(userId,createRideDto);    
    }

    @Get('search')
    async searchRides(@Query('text') searchText: string) {
        return this.rideService.searchRide(searchText);
    }

    @Patch('/:rideId')
    async updateRide(@Param('rideId') rideId: string,@User('sub') userId: string,@Body() updateRideDto: Partial<CreateRideDto>) {
        return this.rideService.updateRide(userId,rideId,updateRideDto);    
    }

    @Get('/:rideId')
    async getRideDetails(@Param('rideId') rideId: string,@User('sub') userId: string) {
        return this.rideService.getRideDetails(rideId,userId);
    }

    @Post('/:rideId/join')
    async acceptRideInvitation(@Param('rideId') rideId: string,@User('sub') userId: string) {
        return this.rideService.acceptRideInvitation(userId,rideId);
    }

    @Delete('/:rideId/leave')
    async leaveRide(@Param('rideId') rideId: string,@User('sub') userId: string) {
        return this.rideService.leaveRide(userId,rideId);
    }

    @Delete('/:rideId/cancel')
    async cancelRide(@Param('rideId') rideId: string,@User('sub') userId: string) {
        return this.rideService.cancelRide(userId,rideId);
    }

    @Post('/:rideId/start')
    async startRide(@Param('rideId') rideId: string,@User('sub') userId: string) {
        return this.rideService.startRide(userId,rideId);
    }

    @Post('/:rideId/end')
    async endRide(@Param('rideId') rideId: string,@User('sub') userId: string) {   
        return this.rideService.endRide(userId,rideId);
    }
}
