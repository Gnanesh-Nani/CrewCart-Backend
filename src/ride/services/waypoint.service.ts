import { Injectable } from "@nestjs/common";
import { CreateBulkWaypointsDto } from "../dtos/createBulkWaypointsDto";
import { Request } from "express";
import { handleError } from "src/common/utils/handle-error";
import { DataSource, Repository } from "typeorm";
import { Waypoint } from "../entities/waypoint.entity";
import { handleResponse } from "src/common/utils/response.utils";
import { InjectRepository } from "@nestjs/typeorm";
import { WaypointTypes } from "src/common/enums/waypoint-types.enum";

@Injectable()
export class WaypointService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Waypoint)
    private waypointRepository: Repository<Waypoint>
  ) {}

  // GET WAYPOINTS
  async getWayPoints(rideId: string) {
    if (!rideId) return handleError("Ride Id Should Not be Null");

    try {
      const data = await this.waypointRepository.find({
        where: { rideId },
        order: { orderIndex: "ASC" },
      });

      const normalizedData = data.map((wp) => ({
        ...wp,
        latitude: wp.location?.coordinates?.[1],
        longitude: wp.location?.coordinates?.[0],
      }));

      return handleResponse(
        normalizedData,
        "Successfully Got Ride Waypoints"
      );
    } catch (error) {
      return handleError(error.message);
    }
  }

  // CREATE BULK WAYPOINTS
  async createBulkWaypoints(
    req: Request,
    rideId: string,
    createBulkWaypoints: CreateBulkWaypointsDto
  ) {
    const userId = req.user?.sub;

    if (!userId) return handleError("userId Cant be Null");

    try {
      return await this.dataSource.transaction(async (manager) => {

        // Validate Start & Destination
        const startCount = createBulkWaypoints.waypoints.filter(
          (wp) => wp.type === WaypointTypes.START
        ).length;

        const endCount = createBulkWaypoints.waypoints.filter(
          (wp) => wp.type === WaypointTypes.DESTINATION
        ).length;

        if (startCount !== 1 || endCount !== 1) {
          return handleError(
            "Bulk Waypoints must contain exactly one START and one DESTINATION"
          );
        }

        // Delete Existing Waypoints
        await manager.delete(Waypoint, { rideId });

        // Create Entities Safely
        const waypointEntities = manager.create(
          Waypoint,
          createBulkWaypoints.waypoints.map((wp) => ({
            rideId,
            type: wp.type,
            location: {
              type: "Point" as const,
              coordinates: [
                wp.longitude,
                wp.latitude,
              ] as [number, number],
            },
            orderIndex: wp.orderIndex,
          }))
        );

        // Save Entities
        const data = await manager.save(waypointEntities);

        return handleResponse(data, "Successfully Inserted Waypoints");
      });
    } catch (error) {
      return handleError(error.message);
    }
  }
}