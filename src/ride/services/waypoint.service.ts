import {  Injectable, Logger } from "@nestjs/common";
import { CreateBulkWaypointsDto } from "../dtos/createBulkWaypointsDto";
import { Request } from "express";
import { handleError } from "src/common/utils/handle-error";
import { DataSource, Repository } from "typeorm";
import { Waypoint } from "../entities/waypoint.entity";
import { handleResponse } from "src/common/utils/response.utils";
import { InjectRepository } from "@nestjs/typeorm";
import { WaypointTypes } from "src/common/enums/waypoint-types.enum";

@Injectable()
export class WaypointService{
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Waypoint) private waypointRepository: Repository<Waypoint>
    ){}

    async getWayPoints(rideId:string){
        if(!rideId)
            handleError("Ride Id Should Not be Null");
        try {
            const data = await this.waypointRepository.find(
                {
                    where:{
                        rideId
                    },
                    select:{}
                }
            )
            return handleResponse(data,"Sucessfully Got Ride Waypoints");
        }catch(error){
            return handleError(error.message)
        }
    }

    async createBulkWaypoints(req: Request,rideId:string,createBulkWaypoints: CreateBulkWaypointsDto) {
        const userId = req.session.sub;
        if(!userId) 
            return handleError("userId Cant be Null");
        try {
            return this.dataSource.transaction(async (manager) => {
                const isWayPointsExist = await manager.exists(Waypoint,{
                    where:{
                        rideId
                    }
                })
                if(isWayPointsExist)
                    return handleError("A Set of Waypoints Previously exist, Cant Insert them at bulk");
                let startCount = createBulkWaypoints.waypoints.filter((wp) => {
                    return wp.type === WaypointTypes.START
                }).length;
                
                let endCount = createBulkWaypoints.waypoints.filter((wp) => {
                    return wp.type === WaypointTypes.DESTINATION
                }).length;
                if(startCount !== 1 || endCount !== 1)
                    return handleError("A Bulk WayPoint must have one start waypoint,end waypoint")

                const waypointEntities = createBulkWaypoints.waypoints.map((wp)=> ({
                    rideId: rideId,
                    type: wp.type,
                    latitude: wp.latitude.toString(),
                    longitude: wp.longitude.toString(),
                    orderIndex: wp.orderIndex
                }))
                const data = await manager.save(Waypoint,waypointEntities);
                return handleResponse(data,"Successfully Inserted the data");
            })
        } catch(error) {
            return handleError(error.message);
        }
    }
}