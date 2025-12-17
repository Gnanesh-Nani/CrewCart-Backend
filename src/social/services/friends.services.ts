import { Body, Injectable, Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Request } from "express";
import { FriendShip } from "../entities/friendships.entity";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { handleError } from "src/common/utils/handle-error";
import { RequestStatus } from "src/common/enums/friend-request-status.enum";
import { handleResponse } from "src/common/utils/response.utils";

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(FriendShip) private friendshipRepository: Repository<FriendShip>,
        @InjectRepository(User) private userRepository: Repository<User>
    ) { }
    async getMyFriends(@Req() req: Request) {
        try {
            const userId = req.session.sub;
            const friendsList = await this.friendshipRepository.createQueryBuilder("friendships")
                .where('(friendships.userId1 = :userId OR friendships.userId2 = :userId)', { userId })
                .andWhere('friendships.status = :status', { status: RequestStatus.ACCEPTED })
                .getMany();
            return handleResponse({friendsList}, "friends data received sucessfully");
        } catch (error) {
            return handleError(error.message);
        }
    }

    async getFriendRequestList(@Req() req: Request) {
        try {
            const userId = req.session.sub;
            const friendships = await this.friendshipRepository.createQueryBuilder("friendships")
                .where('(friendships.userId1 = :userId OR friendships.userId2 = :userId)', { userId })
                .andWhere('friendships.status = :status', { status: RequestStatus.PENDING })
                .getMany()
            let send: FriendShip[] = []
            let received:FriendShip[]  = []
            for(const friendship of friendships){
                if(friendship.requestedBy === userId)
                    send.push(friendship);
                else
                    received.push(friendship);
            }
            return handleResponse({send,received}, "friends data received sucessfully");

        } catch (error) {
            return handleError(error.message);
        }
    }


    async sendFriendRequest(@Req() req: Request, friendId: string) {
        try {
            const userId = req.session.sub;
            if (!userId || !friendId)
                return handleError("userId or friendId is undefined");
            if (userId === friendId)
                return handleError("Cant Send Friend Request to Yourself!")

            const [userId1, userId2] = [userId, friendId].sort((a, b) => a - b);

            const friendship = await this.friendshipRepository.create({
                userId1,
                userId2,
                requestedBy: userId,
                status: RequestStatus.PENDING
            });
            await this.friendshipRepository.save(friendship);
            return handleResponse(friendship, "Friend Request send sucessfully");
        } catch (error) {
            return handleError(error.message)
        }
    }

    async acceptFriendRequest(@Req() req: Request, friendId: string) {
        try {
            const userId = req.session.sub;
            if (!userId || !friendId)
                return handleError("userId or friendId is undefined");

            const [userId1, userId2] = [userId, friendId].sort((a, b) => a - b);

            const friendship = await this.friendshipRepository.findOne({
                where: {
                    userId1,
                    userId2
                }
            });
            if (!friendship)
                return handleError("there is no request found with that user to accept");
            friendship.status = RequestStatus.ACCEPTED;
            await this.friendshipRepository.save(friendship);
            return handleResponse(friendship, "requests updated sucessfully");
        } catch (error) {
            return handleError(error.message)
        }
    }

    async removeFriend(@Req() req: Request, friendId: string) {
        try {
            const userId = req.session.sub;
            if (!userId || !friendId)
                return handleError("userId or friendId is undefined");

            const [userId1, userId2] = [userId, friendId].sort((a, b) => a - b);

            const friendship = await this.friendshipRepository.findOne({
                where: {
                    userId1,
                    userId2
                }
            })
            if (!friendship)
                return handleError("You Guys are not even friends");
            await this.friendshipRepository.remove(friendship);
            return handleResponse({},"Sucessfully Removed the Friend ");
        } catch (error) {
            return handleError(error.message)
        }
    }
}