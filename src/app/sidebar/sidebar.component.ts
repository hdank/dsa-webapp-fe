import { Component } from '@angular/core';
import { SharedModuleComponent } from '../shared-module/shared-module.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthserviceService } from '../authservice.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModuleComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(private authService: AuthserviceService, private router: Router){

  }

  logout(){
    console.log("Log out function in side bar clicked");
    window.localStorage.clear();
    sessionStorage.clear();
    this.authService.Logout();
  }
  navigateToGeneralPage(){
    this.router.navigate(['/general']);
  }
  navigateToChatPage(){
    this.router.navigate(['/chat']);
  }
}
