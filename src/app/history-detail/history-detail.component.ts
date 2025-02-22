import {Component} from '@angular/core';
import {Location, NgForOf, NgIf} from "@angular/common";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {environments} from "../../environments/environments";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    SidebarComponent
  ],
  templateUrl: './history-detail.component.html',
  styleUrl: './history-detail.component.scss'
})
export class HistoryDetailComponent {
  protected historyConv:any[]= []
  protected convDetail:any[]= []
  protected userId: string|null = null
  protected convId: string|null = null
  private flaskUrl = `${environments.API_FLASK_BE}`;  // Base API URL
  private baseUrl = `${environments.API_JAVA_BE}`;  // Base API URL

  constructor(private route:ActivatedRoute,
              private router:Router,
              private location:Location) {
  }
  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('user-id')
      this.convId = params.get('conv-id')
    })

    await fetch(`${this.baseUrl}/user/get-conversations?id=${this.userId}`)
      .then(response => response.json())
      .then(data => {
        this.historyConv = data  // Store conversation history
      });

    await fetch(`${this.flaskUrl}/conversation_history/${this.convId}`)
      .then(response => response.json())
      .then(data => {
        console.log(data.data.history)
        this.convDetail = data.data.history  // Store conversation history
      });
  }

  navBack(){
    this.location.back();
  }

  dateFormat(date:string){
    let newDate = new Date(Number(date)*1000);
    // Get day , month , year
    const day = String(newDate.getDate()).padStart(2, "0");
    const month = String(newDate.getMonth() + 1).padStart(2, "0"); // Tháng trong JS tính từ 0
    const year = newDate.getFullYear();

    // Get hour , min , sec
    const hours = String(newDate.getHours()).padStart(2, "0");
    const minutes = String(newDate.getMinutes()).padStart(2, "0");
    const seconds = String(newDate.getSeconds()).padStart(2, "0");

    // format
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }
}
