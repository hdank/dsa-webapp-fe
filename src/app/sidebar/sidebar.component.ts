import {Component, OnInit} from '@angular/core';
import { SharedModuleComponent } from '../shared-module/shared-module.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthserviceService } from '../authservice.service';
import {UserComponent} from "../user/user.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { ActivatedRoute } from '@angular/router';
import {environments} from "../../environments/environments";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModuleComponent, NgIf, NgForOf, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  constructor(private authService: AuthserviceService,
              private router: Router,
              private http:HttpClient ,
              private activeRouter:ActivatedRoute){

  }
  private userId = ''
  public role!: string;
  private userUrl = `${environments.API_JAVA_BE}/user`;
  public sideExtend = true;
  user!: UserComponent;
  activeItem = 'general';
  ngOnInit(): void {
    this.userId = this.authService.getMssv()  // Set init userId for set conversations record
    this.activeRouter.url.subscribe(segments => {
      this.activeItem = segments[0].path
    })
    let token = this.authService.getToken();
    let parsedToken =  String(token);
    this.http.get<{role: string}>(`${this.userUrl}/is-admin-or-user`, {params: {token:parsedToken}}).subscribe(
      data=>{
        this.role = data.role;
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
  navigateToVisualGoPage(){
    this.router.navigate(['/visual/array']);
  }
  historyToggle(){
    document.getElementById("history-list")?.classList.toggle('show');
  }



  onExtend(){
    this.sideExtend = !this.sideExtend
  }
}
