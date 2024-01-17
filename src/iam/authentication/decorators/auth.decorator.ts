import { SetMetadata } from "@nestjs/common";
import { AuthType } from "src/iam/enums/auth-type.enum";


export const AUTH_TYPE_KEY = 'authType';

export const Auth = (...authType: AuthType[]) => SetMetadata(AUTH_TYPE_KEY, authType)