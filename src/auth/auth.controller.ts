import { Body, Controller, Inject, Logger, Post, Req, Res } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './services/auth.services';
import { LoginDto } from './dtos/login.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private authService: AuthService){}
    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: LoginDto, @Res({passthrough:true}) res: Response) {
        return this.authService.login(body,res);
    }

    @Post('refresh')
    async refresh(@Req() req: Request,@Res({passthrough:true}) res: Response) {
        return this.authService.refresh(req,res);
    }
}
