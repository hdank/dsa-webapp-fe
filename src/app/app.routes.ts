import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { AuthguardService } from './authguard.service';
import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { GeneralDSAComponent } from './general-dsa/general-dsa.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import {StatisticComponent} from "./statistic/statistic.component";
import {FileManagerComponent} from "./file-manager/file-manager.component";
import {ProfileComponent} from "./profile/profile.component";
import {NewChatComponent} from "./new-chat/new-chat.component";
import {UserHistoryComponent} from "./user-history/user-history.component";
import {HistoryDetailComponent} from "./history-detail/history-detail.component";
import {VisualGoComponent} from "./visual-go/visual-go.component";

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path:'auto-login', component:LoginComponent},
    {path: 'chat', component: NewChatComponent},
    {path: 'chat/:id', component: ChatComponent, /*canActivate:[AuthguardService]*/},
    {path: 'logout', redirectTo: '/login', pathMatch: 'full' },
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'sign-up', component: SignupComponent},
    {path: 'general', component:GeneralDSAComponent},
    {path: 'home', component:LandingpageComponent},
    {path: 'statistics', component:StatisticComponent},
    {path: 'statistics/history/:user-id', component:UserHistoryComponent},
    {path: 'statistics/history/:user-id/:conv-id', component:HistoryDetailComponent},
    {path: 'file-manager', component:FileManagerComponent},
    {path: 'visual/:graph', component:VisualGoComponent}
];
