import { Inject, Injectable, Logger } from "@nestjs/common";
import { RegisterDto } from "../dtos/register.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { handleResponse } from "src/common/utils/response.utils";
import { handleError } from "src/common/utils/handle-error";
import { LoginDto } from "../dtos/login.dto";
import { Request, Response } from "express";


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @Inject(ConfigService) private configService: ConfigService,
        @Inject(JwtService) private jwtService: JwtService
    ) { }

    private async generateAccessTokens(user: User) {
        const payload = { sub: user.id, email: user.email };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET_KEY'),
            expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
        });

        return accessToken;
    }

    private async generateRefreshTokens(user: User) {
        const payload = { sub: user.id, email: user.email };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('REFRESH_SECRET_KEY'),
            expiresIn: this.configService.get('REFRESH_EXPIRATION_TIME'),
        });

        return accessToken;
    }

    async register(registerDto: RegisterDto) {
        try {
            const password_hash = await bcrypt.hash(registerDto.password,12);
            const user = this.userRepository.create(
                {
                    
                    email: registerDto.email,
                    phone: registerDto.phone,
                    passwordHash: password_hash,
                    profile: {
                        fullName: registerDto.fullName,
                        userName: registerDto.username
                    }
                }
            )
            await this.userRepository.save(user)

            return handleResponse({}, "User Created Successfully");
        } catch (error) {
            return handleError(error.message);
        }
    }

    async login(loginDto: LoginDto, res: Response) {
        try {
            const user = await this.userRepository.findOne({ where: { email: loginDto.email } })

            if (!user)
                return handleError("This Email Not Registered")

            const isPasswordValid = await bcrypt.compare(
                loginDto.password,
                user.passwordHash
            );

            if (!isPasswordValid) {
                return handleError("Invalid Password");
            }

            const accessToken = await this.generateAccessTokens(user);
            const refreshToken = await this.generateRefreshTokens(user);

            res.setHeader('Set-Cookie', [
                `jwt=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax`,
                `refresh=${refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=604800; SameSite=Lax`,
            ]);
            
            const { passwordHash,status,createdAt,updatedAt,...filteredUser} = user;
            return handleResponse(filteredUser, "Login Successfull");
        } catch (error) {
            return handleError(error.message);
        }
    }

    async refresh(req: Request,res: Response) {
        try {
            const refreshToken :string = req.cookies.refresh;
            if(!refreshToken)
                return handleError("No Refresh Token Found");
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('REFRESH_SECRET_KEY'),
                });

            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            });

            if (!user) {
                return handleError('User not found');
            }

            const newAccessToken = await this.generateAccessTokens(user);
            const newRefreshToken = await this.generateRefreshTokens(user);

            res.setHeader('Set-Cookie', [
            `jwt=${newAccessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax`,
            `refresh=${newRefreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=604800; SameSite=Lax`,
            ]);

            return handleResponse({}, 'Token Refreshed successfully');
        } catch (error){
            return handleError(error.message);
        }
    }
}