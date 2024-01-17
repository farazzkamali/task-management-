import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer
  private readonly authTypeGaurdMap: Record<AuthType, CanActivate | CanActivate[]> = {
    [AuthType.Bearer]:this.accessTokenGuard,
    [AuthType.None]:{canActivate: ()=> true}
  } 
  constructor(
    private readonly reflector:Reflector,
    private readonly accessTokenGuard: AccessTokenGuard
  ){}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    const guards = authTypes.map((type)=>this.authTypeGaurdMap[type]).flat()
    let error = new UnauthorizedException();

    for(const instance of guards){
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err)=>{
        error = err;
      });
      if (canActivate) {
        return true
      }
    }
    throw error 
  }
}
