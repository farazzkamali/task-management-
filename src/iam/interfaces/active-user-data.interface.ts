import { Role } from "src/users/enums/role.enum";

export interface ActiveUserData {
    // user ID
    sub: number;
    email:string;
    role:Role;
}