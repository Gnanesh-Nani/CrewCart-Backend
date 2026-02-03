import { Injectable,  Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Request } from "express";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { handleError } from "src/common/utils/handle-error";
import { RequestStatus } from "src/common/enums/friend-request-status.enum";
import { handleResponse } from "src/common/utils/response.utils";
import { FriendRequest } from "../entities/friend-requests.entity";
import { Friend } from "../entities/friendships.entity";
import { Profile } from "src/user/entities/profile.entity";

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(FriendRequest) private friendRequestRepository: Repository<FriendRequest>,
        @InjectRepository(Friend) private friendRepository: Repository<Friend>
    ) { }

    async isFriends(userId1: string,userId2: string) {
        const [data,count] = await this.friendRepository.findAndCount({where:{
            userId:userId1,
            friendId:userId2
        }})
        return count == 1;
    }

    async getMyFriends(@Req() req: Request) {
        try {
            const userId = req.user.sub;
            const friendsData = await this.friendRepository.createQueryBuilder("f")
                    .innerJoin(Profile,'p','p.userId = f.userId')
                    .where('f.userId = :userId',{userId})
                    .select([
                        'p.userId As userId',
                        'p.userName AS userName',
                        'p.fullName AS fullName',
                        'p.avatarUrl AS avatarUrl',
                        'p.bikeModel AS bikeModel',
                        'p.bikeNumber AS bikeNumber',
                        'p.bio AS bio'
                    ])
                    .getRawMany();

            return handleResponse({ friendsData }, "friends data received sucessfully");
        } catch (error) {
            return handleError(error.message);
        }
    }

    async getFriendRequestList(@Req() req: Request) {
        try {
            const userId = req.user.sub;
            const sended = await this.friendRequestRepository.createQueryBuilder('fr')
                            .innerJoin(Profile,'p','p.userId = fr.receiverId')
                            .where('fr.senderId = :userId',{userId})
                            .andWhere('fr.status = :status',{status:RequestStatus.PENDING})
                            .select([
                                'p.userId As userId',
                                'p.userName AS userName',
                                'p.fullName AS fullName',
                                'p.avatarUrl AS avatarUrl',
                                'p.bikeModel AS bikeModel',
                                'p.bikeNumber AS bikeNumber',
                                'p.bio AS bio'
                            ])
                            .getRawMany();
            const received = await this.friendRequestRepository.createQueryBuilder('fr')
                            .innerJoin(Profile,'p','p.userId = fr.senderId')
                            .where('fr.receiverId = :userId',{userId})
                            .andWhere('fr.status = :status',{status:RequestStatus.PENDING})
                            .select([
                                'p.userId As userId',
                                'p.userName AS userName',
                                'p.fullName AS fullName',
                                'p.avatarUrl AS avatarUrl',
                                'p.bikeModel AS bikeModel',
                                'p.bikeNumber AS bikeNumber',
                                'p.bio AS bio'
                            ])
                            .getRawMany();
            return handleResponse({ sended , received }, "friends data received sucessfully");

        } catch (error) {
            return handleError(error.message);
        }
    }


    async sendFriendRequest(@Req() req: Request, receiverId: string) {
        try {
            const senderId = req.user.sub;
            if(senderId == receiverId)
                return handleError("Sender and Receiver Can't be Same User!")
            const isFriends = await this.isFriends(senderId,receiverId);
            if(isFriends)
                return handleError("You Were Already Friends !");
            const friendRequest = await this.friendRequestRepository.create({
                senderId,
                receiverId
            })
            await this.friendRequestRepository.save(friendRequest);
            return handleResponse({},"Friend Request Successfully Sent");
        } catch (error) {
            return handleError(error.message)
        }
    }

    async acceptFriendRequest(@Req() req: Request, senderId: string) {
        try {
            const accepterId = req.user.sub;
            
            const friendRequest = await this.friendRequestRepository.findOne({
                where:{
                    senderId,
                    receiverId:accepterId
                }
            })

            if(!friendRequest)
                return handleError("There is No valid Request Found");

            friendRequest.status = RequestStatus.ACCEPTED;
            const friends = await this.friendRepository.create({
                userId:senderId,
                friendId:accepterId
            })
            const friends_rev = await this.friendRepository.create({
                userId:accepterId,
                friendId:senderId
            })

            // later try deleting the ACCEPTED friendRequest Repository 
            await this.friendRepository.save(friends);
            await this.friendRepository.save(friends_rev);
            await this.friendRequestRepository.save(friendRequest);
            return handleResponse({}, "Sucessfully Accepted the Friend Request");
        } catch (error) {
            return handleError(error.message)
        }
    }

    async removeFriend(@Req() req: Request, friendId: string) {
        try {
            const userId = req.user.sub;
            let [userId1,userId2] = [userId,friendId];
            await this.friendRepository.delete({
                userId:userId1,
                friendId:userId2
            })
            await this.friendRepository.delete({
                userId:userId2,
                friendId:userId1
            })
            return handleResponse({},"Sucessfully Removed the Friend ");
        } catch (error) {
            return handleError(error.message)
        }
    }
}