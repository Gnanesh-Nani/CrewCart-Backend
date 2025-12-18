import { Module } from '@nestjs/common';
import { SocialController } from './controllers/social.controller';
import {
  FriendsController

} from './controllers/friends.controller';
import { FriendsService } from './services/friends.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Friend } from './entities/friendships.entity';
import { FriendRequest } from './entities/friend-requests.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User,Friend,FriendRequest])],
  providers: [FriendsService],
  controllers: [SocialController, FriendsController]
})
export class SocialModule { }
