import { Component } from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {ActivatedRoute, Router} from "@angular/router";
import {environments} from "../../environments/environments";

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [
    NgForOf,
    SidebarComponent,
    NgIf
  ],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.scss'
})
export class UserHistoryComponent {
  protected historyConv:any[]= []
  private userId: string|null = null
  private baseUrl = `${environments.API_JAVA_BE}`;  // Base API URL

    constructor(private route:ActivatedRoute,
                private router:Router,) {
    }
    async ngOnInit() {
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('user-id')
      })

      await fetch(`${this.baseUrl}/user/get-conversations?id=${this.userId}`)
        .then(response => response.json())
        .then(data => {
          this.historyConv = data  // Store conversation history
        });
    }

  navDetail(convId:string){
    this.router.navigate([`${this.router.url}/${convId}`]);
  }

  // Format the date using DatePipe
  dateFormat(time: string) {
    return new DatePipe('en-US').transform(time, 'dd/MM/yyyy HH:mm:ss');  // Format the date string
  }
}
