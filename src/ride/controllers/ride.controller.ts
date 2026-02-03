import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateRideDto } from '../dtos/createRideDto';
import { RideService } from '../services/ride.service';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('ride')
@UseGuards(JwtAuthGuard)
export class RideController {
    constructor(
        @Inject() private rideService: RideService
    ) {}

    @Post()
    async createRide(@Req() req:Request,@Body() createRideDto: CreateRideDto) {
        return this.rideService.createRide(req,createRideDto);    
    }

    @Patch('/:rideId')
    async updateRide(@Param('rideId') rideId: string,@Req() req:Request,@Body() updateRideDto: Partial<CreateRideDto>) {
        return this.rideService.updateRide(req,rideId,updateRideDto);    
    }

    @Get('/:rideId')
    async getRideDetails(@Param('rideId') rideId: string) {
        return this.rideService.getRideDetails(rideId);
    }

    @Post('/:rideId/join')
    async acceptRideInvitation(@Param('rideId') rideId: string,@Req() req: Request) {
        return this.rideService.acceptRideInvitation(req,rideId);
    }

    @Delete('/:rideId/leave')
    async leaveRide(@Param('rideId') rideId: string,@Req() req: Request) {
        return this.rideService.leaveRide(req,rideId);
    }

    @Delete('/:rideId/cancel')
    async cancelRide(@Param('rideId') rideId: string,@Req() req: Request) {
        return this.rideService.cancelRide(req,rideId);
    }

    @Post('/:rideId/start')
    async startRide(@Param('rideId') rideId: string,@Req() req: Request) {
        return this.rideService.startRide(req,rideId);
    }

    @Post('/:rideId/end')
    async endRide(@Param('rideId') rideId: string,@Req() req: Request) {   
        return this.rideService.endRide(req,rideId);
    }
}
