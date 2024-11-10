import {Component, OnInit} from '@angular/core';
import { SharedModuleComponent } from '../shared-module/shared-module.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthserviceService } from '../authservice.service';
import {catchError, of, window} from "rxjs";
import {UserComponent} from "../user/user.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModuleComponent, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  constructor(private authService: AuthserviceService, private router: Router, private http:HttpClient){

  }
  public role!: string;
  private userUrl = "http://localhost:8080/user";
  user!: UserComponent;
  ngOnInit(): void {
    let token = localStorage.getItem('authToken');
    let parsedToken =  String(token);
    this.http.get<{role: string}>(`${this.userUrl}/is-admin-or-user`, {params: {token:parsedToken}}).subscribe(
      data=>{
        this.role = data.role;
      }
    );
    console.log(this.role);
  }
  logout(){
    console.log("Log out function in side bar clicked");
    localStorage.clear();
    sessionStorage.clear();
    this.authService.Logout();
  }
  navigateToGeneralPage(){
    this.router.navigate(['/general']);
  }
  navigateToChatPage(){
    this.router.navigate(['/chat']);
  }
  navigateToStatisticsPage(){
    console.log("navigate to statistics page function clicked");
    this.router.navigate(['/statistics']);
  }


}
