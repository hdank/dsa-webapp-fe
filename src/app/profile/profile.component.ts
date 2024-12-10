import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from "../sidebar/sidebar.component";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Authresponse} from "../authresponse";
import {UserComponent} from "../user/user.component";

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
    constructor(private router:Router, private http: HttpClient){}
    private baseUrl = "http://localhost:8080/user";
    ngOnInit(): void {
      const token = localStorage.getItem('authToken');
      if(token){
        const stringToken = String(token);
        this.http.get<UserComponent>(`${this.baseUrl}/get-user-by-token`,{params:{token:stringToken}}).subscribe(
          data=>{
            this.user = data;
          }
        );
      }
    }
}
