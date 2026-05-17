import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RidePresenceService } from "../services/ride-presence.service";
import { RateLimitService } from "../services/rate-limit.service";
import { LocationService } from "../services/location.service";
import { ConfigService } from "@nestjs/config";

@WebSocketGateway({
    namespace: '/crew-ride'
}) 

@Injectable()
export class RideGateway implements OnGatewayConnection,OnGatewayDisconnect {

    @WebSocketServer()
    server!: Server;

    constructor(
        private jwtService: JwtService,
        private presenceService: RidePresenceService,
        private rateLimitService: RateLimitService,
        private locationService: LocationService,
        private configService: ConfigService
    ){}

    afterInit(server: Server) {
        Logger.log('WebSocket Gateway initialized');
    }
    
    async handleConnection(socket: Socket) {
        Logger.log("Connection attempt from:", socket.id);
        try {
            const token = socket.handshake.headers.authorization;

            if (!token) {
                Logger.error("Tokn Not Found !")
                socket.disconnect();
                return;
            }

            const decoded = this.jwtService.verify(token,{
                secret: this.configService.get<string>('JWT_SECRET_KEY'),
            });
            socket.data.userId = decoded.sub;
            socket.data.email = decoded.email;

            Logger.log(`[WS] User ${decoded.sub} connected: ${socket.id}`);
        } catch (error) {
            Logger.error('[WS] Auth failed:', error.message);
            socket.disconnect();
        }
    }

    async handleDisconnect(socket: Socket) {
        Logger.log("Disconnection attempt from:", socket.id);
        const userId = socket.data.userId;
        const rideId = socket.data.rideId;
        if (userId && rideId) {
            await this.presenceService.removeMemberFromRide(rideId, userId);
            await this.presenceService.unmapSocket(socket.id);

            // Notify others
            // this.server.to(`ride:${rideId}`).emit('ride:member_offline', {
            //     userId,
            //     ts: Date.now(),
            // });

            Logger.log(`[WS] User ${userId} left ride ${rideId}`);
        }

    }

    /**
   * Join ride room
   * Event: ride:join
   * Payload: { rideId }
   */
    @SubscribeMessage('ride:join')
    async handleRideJoin( @ConnectedSocket() socket: Socket, @MessageBody() payload: { rideId: string }) {
        const userId = socket.data.userId;
        const rideId = payload.rideId;
        
        if (!userId || !rideId) {
            socket.emit('error1', { message: 'Invalid payload' });
            return;
        }

        // TODO: Verify user is member of this ride (check DB)

        socket.join(`ride:${rideId}`);
        socket.data.rideId = rideId;

        await this.presenceService.addMemberToRide(rideId, userId);
        await this.presenceService.mapSocket(socket.id, userId, rideId);

        // Send snapshot of current members
        const locations = await this.locationService.getAllMemberLocations(rideId);
        socket.emit('ride:snapshot', {
            rideId,
            members: locations,
            ts: Date.now(),
        });

        // Notify others this user joined
        this.server.to(`ride:${rideId}`).emit('ride:member_online', {
            userId,
            ts: Date.now(),
        });

        Logger.log(`[WS] User ${userId} joined ride ${rideId}`);
    }

    /**
     * Leave ride room
     * Event: ride:leave
     * Payload: { rideId }
     */
    @SubscribeMessage('ride:leave')
    async handleRideLeave(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: { rideId: string },
    ) {

        const userId = socket.data.userId;
        const rideId = payload.rideId;
        socket.leave(`ride:${rideId}`);

        await this.presenceService.removeMemberFromRide(rideId, userId);
        await this.presenceService.unmapSocket(socket.id);

        this.server.to(`ride:${rideId}`).emit('ride:member_offline', {
            userId,
            ts: Date.now(),
        });

        Logger.log(`[WS] User ${userId} left ride ${rideId}`);
    }

    /**
   * Location update
   * Event: location:update
   * Payload: { lat, lng, speed?, heading?, accuracy?, clientTs, seq }
   */
    @SubscribeMessage('location:update')
    async handleLocationUpdate(
        @ConnectedSocket() socket: Socket,
        @MessageBody() payload: any,
    ) { 
        const userId =  socket.data.userId;
        const rideId = socket.data.rideId;

        if (!userId || !rideId) {
            socket.emit('error', { message: 'Not in a ride' });
            return;
        }

        // Rate limiting
        const isRateLimited = await this.rateLimitService.isRateLimited(userId);
        if (isRateLimited) {
            socket.emit('error', { message: 'Rate limited' });
            return;
        }

        // Validate location
        const validation = this.locationService.validateLocation(payload);
        if (!validation.valid) {
            socket.emit('error', { message: validation.error });
            return;
        }

        // Store in Redis
        await this.locationService.updateMemberLocation(rideId, userId, payload);

        // Broadcast to ride
        const locationBroadcast = await this.locationService.getMemberLocation(
            rideId,
            userId,
        );

        if (locationBroadcast) {
            this.server.to(`ride:${rideId}`).emit('ride:member_location', locationBroadcast);
        }
    }

    /**
     * Heartbeat / keep-alive (prevents timeout)
     * Event: ping
     */
    @SubscribeMessage('ping')
    handlePing(
        @ConnectedSocket() socket: Socket,
    ) {
        socket.emit('pong', { ts: Date.now() });
    }

}
 