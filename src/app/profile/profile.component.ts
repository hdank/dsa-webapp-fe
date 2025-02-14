import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from "../sidebar/sidebar.component";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Authresponse} from "../authresponse";
import {UserComponent} from "../user/user.component";
import {AuthserviceService} from "../authservice.service";
import {environments} from "../../environments/environments";

@Component({
  selector: 'app-profile',
  standalone: true,
    imports: [
        SidebarComponent
    ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit{
    user!: UserComponent
    constructor(private router:Router, private http: HttpClient , private authService:AuthserviceService){}
    private baseUrl = `${environments.API_JAVA_BE}/user`;
    ngOnInit(): void {
      const token = this.authService.getToken();
      const userId = this.authService.getMssv();
      const userRole = this.authService.getRole();

      if(token){
        this.http.get<UserComponent>(`${this.baseUrl}/get-user-by-token`,{params:{token:token}}).subscribe(
          data=>{
            this.user = data;
          }
        );
      }
    }
}
