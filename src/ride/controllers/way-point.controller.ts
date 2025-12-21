import { Body, Controller, Get, Inject, Param, Patch, Post, Req } from "@nestjs/common";
import { WaypointService } from "../services/waypoint.service";
import { CreateBulkWaypointsDto } from "../dtos/createBulkWaypointsDto";
import type { Request } from "express";

@Controller('ride/:rideId/waypoints')
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