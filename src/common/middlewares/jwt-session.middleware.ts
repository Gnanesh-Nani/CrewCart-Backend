
import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtSessionMiddleware implements NestMiddleware {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(JwtService) private jwtService: JwtService){}
  use(req: Request, res: Response, next: NextFunction) {
    const jwt = req.cookies.jwt;
    if(jwt){
      const payload = this.jwtService.decode(jwt);
      req.session = payload;
    }
    next();
  }
}
