import { Body, Controller, Delete, Get, Inject, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { FriendsService } from "../services/friends.services";

@Controller('friends')
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

    @Post('request/:friendId')
    async sendRequest(@Req() req: Request,@Param('friendId') friendId: string) {
        return this.friendsService.sendFriendRequest(req,friendId);
    }

    @Post('accept/:friendId')
    async acceptRequest(@Req() req: Request,@Param('friendId') friendId: string) {
        return this.friendsService.acceptFriendRequest(req,friendId);
    }

    @Delete('remove/:friendId')
    async removeFriend(@Req() req: Request,@Param('friendId') friendId: string) {
        return this.friendsService.removeFriend(req,friendId);
    }
}