import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/user/entities/profile.entity';
import { User } from 'src/user/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Profile,
  ])],
  providers: [AuthService,JwtService],
  controllers: [AuthController]
})
export class AuthModule {
    
}
