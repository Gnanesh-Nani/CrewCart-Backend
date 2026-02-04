import { Injectable, Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { handleError } from "src/common/utils/handle-error";
import { handleResponse } from "src/common/utils/response.utils";
import { UpdateProfileDto } from "../dtos/updateProfile.dto";
import type { Request } from "express";
import { Ride } from "src/ride/entities/ride.entity";
import { RideMember } from "src/ride/entities/ride-members.entity";
import { Waypoint } from "src/ride/entities/waypoint.entity";
import _ from "lodash";

@Injectable()
export class UserService {

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(User) private userRepository: Repository<User>
    ) { }

    async getMyRides(userId: string) {
        if (!userId)
            return handleError("UserId Should Not Be Null");

        const rows = await this.dataSource
            .createQueryBuilder(Ride, "r")
            .innerJoin(RideMember, "rm", "r.id = rm.rideId")
            .leftJoin(Waypoint, "wp", "wp.rideId = r.id")
            .where("rm.userId = :userId", { userId })
            .orderBy("wp.orderIndex", "ASC")
            .select([
                "r.id AS ride_id",
                "r.title AS ride_title",
                "r.description AS ride_description",
                "r.creatorId AS ride_creator_id",
                "r.visibility AS ride_visibility",
                "r.crewId AS ride_crew_id",
                "r.rideStatus AS ride_status",
                "r.startTime AS ride_start_time",
                "r.endTime AS ride_end_time",
                "r.createdAt AS ride_created_at",

                "wp.id AS waypoint_id",
                "wp.type AS waypoint_type",
                "ST_X(wp.location::geometry) AS waypoint_lng",
                "ST_Y(wp.location::geometry) AS waypoint_lat",
                "wp.orderIndex AS waypoint_order_index"
            ])
            .getRawMany();

        const ridesMap = new Map<string, any>();

        for (const row of rows) {

            if (!ridesMap.has(row.ride_id)) {
                ridesMap.set(row.ride_id, {
                    id: row.ride_id,
                    title: row.ride_title,
                    description: row.ride_description,
                    creatorId: row.ride_creator_id,
                    visibility: row.ride_visibility,
                    crewId: row.ride_crew_id,
                    rideStatus: row.ride_status,
                    startTime: row.ride_start_time,
                    endTime: row.ride_end_time,
                    createdAt: row.ride_created_at,
                    waypoints: []
                });
            }

            if (row.waypoint_id) {
                ridesMap.get(row.ride_id).waypoints.push({
                    id: row.waypoint_id,
                    type: row.waypoint_type,
                    latitude: Number(row.waypoint_lat),
                    longitude: Number(row.waypoint_lng),
                    orderIndex: row.waypoint_order_index
                });
            }
        }

        return handleResponse(
            Array.from(ridesMap.values()),
            "Rides Retrieved Successfully"
        );
    }


    async getProfile(user_id: string) {
        try {
            const user = await this.userRepository.findOne(
                {
                    where: { id: user_id },
                    relations: { profile: true },
                    select: {
                        id: true,
                        status: true,
                        profile: {
                            fullName: true,
                            avatarUrl: true,
                            bikeModel: true,
                            bikeNumber: true,
                            userName: true,
                            bio: true,
                            createdAt: true
                        }
                    }
                }
            )
            if (!user)
                return handleError("Profile Not Found", 404);
            return handleResponse(user);
        } catch (error) {
            return handleError(error.message)
        }
    }

    async getMyProfile(userId: string) {
        return this.getProfile(userId);
    }

    async updateProfile(user_id: string, updateProfileDto: Partial<UpdateProfileDto>) {
        try {
            let user = await this.userRepository.findOne({
                where: {
                    id: user_id
                }
            })
            if (!user)
                return handleError("Profile Not Found", 404);
            let updatedProfileData = { ...user.profile, ...updateProfileDto };
            user.profile = updatedProfileData;
            await this.userRepository.save(user);
            return handleResponse("Profile Updated Successfully");
        } catch (error) {
            return handleError(error.message)
        }
    }
}