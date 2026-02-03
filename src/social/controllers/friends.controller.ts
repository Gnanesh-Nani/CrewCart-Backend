import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { FriendsService } from "../services/friends.services";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(
        @Inject(FriendsService) private friendsService: FriendsService
    ){}
    @Get()
    async getMyFriends(@Req() req: Request) {
        return this.friendsService.getMyFriends(req);
    }

    @Get('requests')
    async getMyRequests(@Req() req: Request) {
        return this.friendsService.getFriendRequestList(req);
    }

    @Post('request/:receiverId')
    async sendRequest(@Req() req: Request,@Param('receiverId') receiverId: string) {
        return this.friendsService.sendFriendRequest(req,receiverId);
    }

    @Post('accept/:senderId')
    async acceptRequest(@Req() req: Request,@Param('senderId') senderId: string) {
        return this.friendsService.acceptFriendRequest(req,senderId);
    }

    @Delete('remove/:friendId')
    async removeFriend(@Req() req: Request,@Param('friendId') friendId: string) {
        return this.friendsService.removeFriend(req,friendId);
    }
}