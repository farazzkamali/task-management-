import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { InvalidateRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
    constructor(@InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService:JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, 
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    ){}


    async signUp(signUpDto:SignUpDto){
        try {
            
            const oldUser = await this.usersRepository.findOne({where:{email:signUpDto.email}})
            if (oldUser) {
                throw new BadRequestException('This user already exists')
            }

            const user = new User()
            user.email = signUpDto.email;
            user.password = await this.hashingService.hash(signUpDto.password)
    
            await this.usersRepository.save(user)            
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new Error('Error while sign up')
        }

    }


    async signIn(signInDto: SignInDto){
        try {
            const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email: signInDto.email })
            .getOne();
    
    
            
            if (!user) {
                throw new UnauthorizedException('User does not exists')
            }
            const isEqual = await this.hashingService.compare(signInDto.password, user.password)
            
            if (!isEqual) {
                throw new UnauthorizedException("Password Does not match")
            }
            return await this.generateTokens(user);
        } catch (error) {
            if (error instanceof  UnauthorizedException) {
                throw error
            }
            throw new Error('Error while sign in')
        }

    }


    async generateTokens(user: User) {
        const refreshTokenId = randomUUID();
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                { email: user.email, role:user.role }),
            this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
                refreshTokenId
            }),
        ]);
        await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId)
        return {
            accessToken,
            refreshToken
        };
    }

    async refreshTokens(refreshTokenDto:RefreshTokenDto){
        try {
        const {sub, refreshTokenId} = await this.jwtService.verifyAsync<
            Pick<ActiveUserData, 'sub'> & {refreshTokenId: string}
            >(refreshTokenDto.refreshToken,{
            secret:this.jwtConfiguration.secret,
            audience:this.jwtConfiguration.audience,
            issuer:this.jwtConfiguration.issuer,
        });
        const user = await this.usersRepository.findOneByOrFail({
            id:sub
        });
        const isValid = await this.refreshTokenIdsStorage.validate(user.id, refreshTokenId)
        if (isValid) {
            await this.refreshTokenIdsStorage.invalidate(user.id)
        }else{
            throw new Error('Refresh Token is invalid')
        }
        return this.generateTokens(user)
            
        } catch (error) {
            if (error instanceof InvalidateRefreshTokenError) {
                throw new UnauthorizedException('Access denied');
            }
            throw new UnauthorizedException()
        }
    }

    private async signToken<T>(userId:number, expiresIn:number, payload?:T) {
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload,
            },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn: this.jwtConfiguration.accessTokenTtl,
            }
        );
    }
}
