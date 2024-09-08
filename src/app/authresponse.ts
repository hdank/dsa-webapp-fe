import { UserComponent } from "./user/user.component";

export interface Authresponse {
    token: string;
    user: UserComponent
}
