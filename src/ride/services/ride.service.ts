import { Injectable, Logger, Req } from "@nestjs/common";
import { Ride } from "../entities/ride.entity";
import { handleError } from 'src/common/utils/handle-error';
import { CreateRideDto } from "../dtos/createRideDto";
import { handleResponse } from "src/common/utils/response.utils";
import { RideStatus } from "src/common/enums/ride-status.enum";
import { RideMember } from "../entities/ride-members.entity";
import { RiderRoles } from "src/common/enums/rider-roles.enum";
import { DataSource, ILike, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RideMemberStatus } from "src/common/enums/ride-member-status.enum";
import { User } from "src/common/decorators/user.decorator";
import { RideVisibility } from "src/common/enums/ride-types.enum";


@Injectable()
export class RideService {

    constructor(
        @InjectRepository(Ride) private rideRepository: Repository<Ride>,
        private dataSource: DataSource
    ) { }

    async createRide(@User('sub') userId: string, createRideDto: CreateRideDto) {

        try {
            return await this.dataSource.transaction(async (manager) => {
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
                return handleResponse({ ride: savedRide }, "Ride Created Successfully")
            })
        } catch (error) {
            return handleError(error.message)
        }
    }

    async searchRide(searchText: string) {
        if(!searchText)
            return handleError("please provide a search term")
        try {
            const rides = await this.rideRepository.find({
                where: [
                    {
                        title: ILike(`%${searchText}%`),
                        visibility: RideVisibility.PUBLIC
                    },
                    {
                        description: ILike(`%${searchText}%`),
                        visibility: RideVisibility.PUBLIC
                    }
                ],
                select: {
                    id: true,
                    title: true,
                    description: true
                }
            })
            console.log(rides)
            return handleResponse(rides , "Rides found successfully");
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

    async updateRide(@User('sub') userId: string, rideId: string, updateRideDto: Partial<CreateRideDto>) {
        if (!userId)
            return handleError("User Id Should be Not Null");
        if (!rideId) {
            return handleError("Please Enter a valid Ride Id");
        }
        try {
            return await this.dataSource.manager.transaction(async (manager) => {
                let ride = await manager.findOne(Ride, {
                    where: {
                        id: rideId
                    }
                })
                if (!ride)
                    return handleError("Ride Not found");
                const rideMember = await manager.findOne(RideMember, {
                    where: {
                        rideId,
                        userId
                    }
                })
                if (!rideMember)
                    return handleError("Your are not belong to this ride");

                if (rideMember.role !== RiderRoles.LEADER)
                    return handleError("You Dont have enought access");

                manager.merge(Ride, ride, updateRideDto)
                const saved = await manager.save(ride);
                return handleResponse({ saved }, "Successfully updated the ride Info");
            })
        } catch (error) {
            return handleError(error.message)
        }
    }
    
    async acceptRideInvitation(@User('sub') userId: string, rideId: string) {
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

                const isAlreadyMember = await manager.exists(RideMember, {
                    where: {
                        rideId,
                        userId
                    }
                })
                console.log(isAlreadyMember)
                if (isAlreadyMember){
                    Logger.debug("You are already member of this ride")
                    return handleError("You are already member of this ride");
                }
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

    async leaveRide(@User('sub') userId: string, rideId: string) {
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
                const rideMember = await manager.findOne(RideMember, {
                    where: {
                        rideId,
                        userId
                    }
                })
                if (!rideMember)
                    return handleError("You are not a member of this ride");

                if (ride.rideStatus === RideStatus.CREATED) {
                    await manager.delete(RideMember, {
                        rideId,
                        userId
                    });
                } else if (ride.rideStatus === RideStatus.STARTED) {
                    //handle later
                }
                return handleResponse({}, "Successfully Left the Ride");
            })
        } catch (error) {
            return handleError(error.message);
        }
    }

    async updateRideStatus(manager: any, userId: string, rideId: string, expectedRole: RiderRoles, newStatus: RideStatus, expectedOldStatus?: RideStatus) {
        if (!userId)
            return handleError("User Id not Found")
        if (!rideId)
            return handleError("Ride Id not Found")
        try {
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
        } catch (error) {
            return handleError(error.message)
        }
    }

    async updateRideMemberStatus(manager: any, userId: string, rideId: string, expectedOldStatus: RideMemberStatus, newStatus: RideMemberStatus) {
        try {
            const rideMember = await manager.findOne(RideMember, {
                where: {
                    rideId,
                    userId
                }
            })

            if (!rideMember)
                return handleError("You are not a member of this ride");

            if (rideMember.status != expectedOldStatus)
                return handleError(`to update ride status to ${newStatus} the status should be in ${expectedOldStatus}`)

            rideMember.status = newStatus;

            if (newStatus == RideMemberStatus.COMPLETED)
                rideMember.completedAt = new Date();
            else if (newStatus == RideMemberStatus.STARTED)
                rideMember.startedAt = new Date();

            await manager.save(rideMember);
        } catch (err) {
            Logger.debug(err.message)
            throw Error(err.message)
        }
    }

    async cancelRide(userId: string, rideId: string) {
        return await this.dataSource.transaction(async (manager) => {
            return this.updateRideStatus(
                manager,
                userId,
                rideId,
                RiderRoles.LEADER,
                RideStatus.CANCELLED,
                RideStatus.CREATED
            );
        });
    }

    async startRide(userId: string, rideId: string) {
        return await this.dataSource.transaction(async (manager) => {
            try {
                await this.updateRideMemberStatus(
                    manager,
                    userId,
                    rideId,
                    RideMemberStatus.JOINED,
                    RideMemberStatus.STARTED
                )
                const ride = await manager.findOne(Ride,{where:{
                    id:rideId
                }})

                if(!ride)
                    return handleError("Ride Id not Found")

                if(ride.creatorId == userId){
                    await this.updateRideStatus(
                        manager,
                        userId,
                        rideId,
                        RiderRoles.LEADER,
                        RideStatus.STARTED,
                        RideStatus.CREATED
                    );
                }
                return handleResponse({},"ride Updated Sucessfully");
            } catch (err) {
                return handleError(err.message)
            }
        });
    }

    async endRide(userId: string, rideId: string) {
        return await this.dataSource.transaction(async (manager) => {
            return this.updateRideStatus(
                manager,
                userId,
                rideId,
                RiderRoles.LEADER,
                RideStatus.ENDED,
                RideStatus.STARTED
            );
        });
    }

    async postPoneRide() {

    }

}