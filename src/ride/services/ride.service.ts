import { Injectable, Req } from "@nestjs/common";
import { Ride } from "../entities/ride.entity";
import { handleError } from 'src/common/utils/handle-error';
import type { Request } from "express";
import { CreateRideDto } from "../dtos/createRideDto";
import { handleResponse } from "src/common/utils/response.utils";
import { RideStatus } from "src/common/enums/ride-status.enum";
import { RideMember } from "../entities/ride-members.entity";
import { RiderRoles } from "src/common/enums/rider-roles.enum";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class RideService {

    constructor(
        @InjectRepository(Ride) private rideRepository: Repository<Ride>,
        private dataSource: DataSource
    ) { }

    async createRide(@Req() req: Request, createRideDto: CreateRideDto) {

        try {
            return await this.dataSource.transaction(async (manager) => {
                const userId = req.session.sub;
                const newRide = manager.create(Ride, {
                    ...createRideDto,
                    creatorId: userId,
                })
                const savedRide = await manager.save(newRide);
                const rideMember = manager.create(RideMember,
                    {
                        rideId: savedRide.id,
                        userId,
                        role: RiderRoles.LEADER
                    }
                )
                await manager.save(rideMember);
                return handleResponse({}, "Ride Created Succesfully")
            })
        } catch (error) {
            return handleError(error.message)
        }
    }

    async getRideDetails(rideId: string) {
        if (!rideId) {
            return handleError("Please Enter a valid Ride Id");
        }

        try {
            const ride = await this.rideRepository.findOne({
                where: { id: rideId },
            });

            if (!ride) {
                return handleError("No Ride Found", 404);
            }

            return handleResponse({ ride }, "Ride Found Successfully");
        } catch (error) {
            return handleError(error.message);
        }
    }

    async updateRide(req:Request,rideId:string,updateRideDto: Partial<CreateRideDto>) {
        const userId = req.session.sub;
        if (!userId)
            return handleError("User Id Should be Not Null");
        if (!rideId) {
            return handleError("Please Enter a valid Ride Id");
        }
        try {
            return await this.dataSource.manager.transaction(async (manager) =>{
                let ride = await manager.findOne(Ride,{
                    where:{
                        id:rideId
                    }
                })
                if(!ride)
                    return handleError("Ride Not found");
                const rideMember = await manager.findOne(RideMember,{
                    where:{
                        rideId,
                        userId
                    }
                })
                if(!rideMember)
                    return handleError("Your are not belong to this ride");

                if(rideMember.role !== RiderRoles.LEADER)
                    return handleError("You Dont have enought access");
                
                manager.merge(Ride,ride,updateRideDto)
                const saved = await manager.save(ride);
                return handleResponse({saved},"Successfully updated the ride Info");
            })
        }catch(error){
            return handleError(error.message)
        }
    }

    async acceptRideInvitation(@Req() req: Request, rideId: string) {
        const userId = req.session.sub;
        if (!userId)
            return handleError("User Id Should be Not Null");
        if (!rideId)
            return handleError("Please Enter a valid Ride Id");
        try {
            return await this.dataSource.transaction(async (manager) => {

                const ride = await manager.findOne(Ride, {
                    where: {
                        id: rideId
                    }
                })

                if (!ride)
                    return handleError("Invalid RideID!")

                if (ride.rideStatus != RideStatus.CREATED)
                    return handleError(`The ride is already ${ride.rideStatus}`)

                const isAlreadyMember = await manager.exists(RideMember,{
                    where:{
                        rideId,
                        userId
                    }
                })
                if(isAlreadyMember)
                    return handleError("You are already member of this ride");

                const rideMember = await manager.create(
                    RideMember,
                    {
                        rideId,
                        userId,
                        role: RiderRoles.MEMBER
                    }
                )
                await manager.save(rideMember)

                return handleResponse("Successfully Joined the Ride")
            })
        } catch (error) {
            return handleError(error.message)
        }
    }

    async leaveRide(@Req() req: Request,rideId:string){
        const userId = req.session.sub;
        if (!userId)
            return handleError("User Id Should be Not Null");
        if (!rideId)
            return handleError("Please Enter a valid Ride Id");
        try {
            return await this.dataSource.transaction(async (manager) => {

                const ride = await manager.findOne(Ride, {
                    where: {
                        id: rideId
                    }
                })

                if (!ride)
                    return handleError("Invalid RideID!")

                if (ride.rideStatus === RideStatus.ENDED)
                    return handleError(`The ride is already ${ride.rideStatus}`);

                //two type of leave
                //leaving before the start and after the ride
                const rideMember = await manager.findOne(RideMember,{
                    where:{
                        rideId,
                        userId
                    }
                })
                if(!rideMember)
                    return handleError("You are not a member of this ride");

                if(ride.rideStatus === RideStatus.CREATED){
                    await manager.delete(RideMember,{
                        rideId,
                        userId
                    });
                } else if(ride.rideStatus === RideStatus.STARTED){
                    //handle later
                }
                return handleResponse({},"Successfully Left the Ride");
            })
        } catch(error) {
            return handleError(error.message);
        }   
    }

    async updateRideStatus(userId: string, rideId: string, expectedRole: RiderRoles, newStatus: RideStatus, expectedOldStatus?: RideStatus) {
        if (!userId)
            return handleError("User Id not Found")
        if (!rideId)
            return handleError("Ride Id not Found")
        try {
            return await this.dataSource.transaction(async (manager) => {
                const ride = await manager.findOne(Ride, {
                    where: {
                        id: rideId
                    }
                })

                const rideMember = await manager.findOne(RideMember, {
                    where: {
                        rideId,
                        userId
                    }
                })

                if (!rideMember)
                    return handleError("You are not in This Ride")

                if (rideMember.role != expectedRole)
                    return handleError(`You are not the ${expectedRole} u can't make the ride ${newStatus}`);

                if (!ride)
                    return handleError("Ride Not Found")

                if (expectedOldStatus && ride.rideStatus !== expectedOldStatus)
                    return handleError(`to update ride status to ${newStatus} the status should be in ${expectedOldStatus}`)

                if (ride.rideStatus == newStatus)
                    return handleError(`Ride Already ${newStatus}`)

                ride.rideStatus = newStatus;
                await manager.save(ride);
                return handleResponse({}, `Sucessfully ${newStatus} the Ride`)
            })
        } catch (error) {
            return handleError(error.message)
        }
    }

    async cancelRide(@Req() req: Request, rideId: string) {
        return this.updateRideStatus(
            req.session.sub,
            rideId,
            RiderRoles.LEADER,
            RideStatus.CANCELLED,
            RideStatus.CREATED
        );
    }

    async startRide(@Req() req: Request, rideId: string) {
        return this.updateRideStatus(
            req.session.sub,
            rideId,
            RiderRoles.LEADER,
            RideStatus.STARTED,
            RideStatus.CREATED
        );
    }

    async endRide(@Req() req: Request, rideId: string) {
        return this.updateRideStatus(
            req.session.sub,
            rideId,
            RiderRoles.LEADER,
            RideStatus.ENDED,
            RideStatus.STARTED
        );
    }

    async postPoneRide() {
        
    }

}