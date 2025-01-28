import {Component, OnInit} from '@angular/core';
import { SharedModuleComponent } from '../shared-module/shared-module.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthserviceService } from '../authservice.service';
import {UserComponent} from "../user/user.component";
import {NgIf} from "@angular/common";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModuleComponent, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  constructor(private authService: AuthserviceService, private router: Router, private http:HttpClient , private activeRouter:ActivatedRoute){

  }
  public role!: string;
  private userUrl = "http://localhost:8080/user";
  user!: UserComponent;
  activeItem = 'general';
  ngOnInit(): void {
    this.activeRouter.url.subscribe(segments => {
      this.activeItem = segments[0].path
    })
    //let token = localStorage.getItem('authToken');
    let token = this.authService.getToken();
    let parsedToken =  String(token);
    this.http.get<{role: string}>(`${this.userUrl}/is-admin-or-user`, {params: {token:parsedToken}}).subscribe(
      data=>{
        this.role = data.role;
        console.log(this.role);
      }
    );
  }

  logout(){
    this.authService.deleteToken();
    this.router.navigate(['/login']);
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
  navigateToFileManagerPage(){
    this.router.navigate(['/file-manager']);
  }
  navigateToProfile(){
    this.router.navigate(['/profile']);
  }

}
