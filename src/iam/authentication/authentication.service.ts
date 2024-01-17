import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class AuthenticationService {
    constructor(@InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingServie: HashingService,
    private readonly jwtService:JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, 
    ){}


    async signUp(signUpDto:SignUpDto){
        try {
            const user = new User()
            user.email = signUpDto.email;
            user.password = await this.hashingServie.hash(signUpDto.password)
    
            await this.usersRepository.save(user)            
        } catch (error) {
            throw error
        }

    }


    async signIn(signInDto: SignInDto){
        const user = await this.usersRepository.findOneBy({email:signInDto.email})
        if (!user) {
            throw new UnauthorizedException('User does not exists')
        }
        const isEqual = await this.hashingServie.compare(signInDto.password, user.password)
        if (!isEqual) {
            throw new UnauthorizedException("Password Does not match")
        }
        return await this.generateTokens(user);
    }


    async generateTokens(user: User) {
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                { email: user.email }),
            this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
        ]);
        return {
            accessToken,
            refreshToken
        };
    }

    async refreshTokens(refreshTokenDto:RefreshTokenDto){
        try {
        const {sub} = await this.jwtService.verifyAsync<
            Pick<ActiveUserData, 'sub'>
            >(refreshTokenDto.refreshToken,{
            secret:this.jwtConfiguration.secret,
            audience:this.jwtConfiguration.audience,
            issuer:this.jwtConfiguration.issuer,
        });
        const user = await this.usersRepository.findOneByOrFail({
            id:sub
        });
        return this.generateTokens(user)
            
        } catch (error) {
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