import { Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { WaypointService } from "../services/waypoint.service";
import { CreateBulkWaypointsDto } from "../dtos/createBulkWaypointsDto";
import type { Request } from "express";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@Controller('ride/:rideId/waypoints')
@UseGuards(JwtAuthGuard)
export class WaypointController{
    constructor(
        @Inject(WaypointService) private waypointService: WaypointService
    ){}


    @Get()
    async getRideWayPoints(@Param('rideId') rideId: string) {
        return this.waypointService.getWayPoints(rideId)
    }

    @Post()
    async createBulkWaypoints(@Req() req: Request,@Param('rideId') rideId: string,@Body() createBulkWaypointsDto: CreateBulkWaypointsDto) {
        return this.waypointService.createBulkWaypoints(req,rideId,createBulkWaypointsDto);
    }

    @Patch()
    async reorderWaypoint() {

    }

    @Patch()
    async updateWaypoint() {

    }
}