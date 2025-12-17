import { Module } from '@nestjs/common';
import { SocialController } from './controllers/social.controller';
import { FriendsController

 } from './controllers/friends.controller';
import { FriendsService } from './services/friends.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendShip } from './entities/friendships.entity';
import { User } from 'src/user/entities/user.entity';
@Module({
  imports:[TypeOrmModule.forFeature([FriendShip,User])],
  providers:[FriendsService],
  controllers: [SocialController, FriendsController]
})
export class SocialModule {}
