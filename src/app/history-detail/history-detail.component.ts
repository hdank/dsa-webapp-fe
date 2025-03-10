import { Component, OnInit} from '@angular/core';
import {Location, NgForOf, NgIf} from "@angular/common";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {environments} from "../../environments/environments";
import {ActivatedRoute, Router} from "@angular/router";
import {ChatService} from "../../service/chat.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HistoryBarComponent} from "../history-bar/history-bar.component";
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    SidebarComponent,
    FormsModule,
    HistoryBarComponent,
    ReactiveFormsModule
  ],
  templateUrl: './history-detail.component.html',
  styleUrls: ['../chat/chat.component.scss','history-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class HistoryDetailComponent implements OnInit  {
  protected historyConv: Array<{ id: string; name: string }> = [];
  protected convDetail: Array<{ sender: string; message: string }> = [];
  protected userId: string|null = null
  protected convId: string|null = null
  private flaskUrl = `${environments.API_FLASK_BE}`;  // Base API URL
  private baseUrl = `${environments.API_JAVA_BE}`;  // Base API URL

  constructor(private route:ActivatedRoute,
              private router:Router,
              private location:Location,
              protected chatService: ChatService,
              ) {
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('user-id');
      this.convId = params.get('conv-id');
    });

    try {
      const historyResponse = await fetch(`${this.baseUrl}/user/get-conversations?id=${this.userId}`);
      this.historyConv = await historyResponse.json();  // Store conversation history

      const detailResponse = await fetch(`${this.flaskUrl}/conversation_history/${this.convId}`);
      const detailData = await detailResponse.json();
      console.log(detailData.data.messages);
      this.convDetail = detailData.data.messages;
      this.setHistoryInit();
    } catch (error) {
      console.error("Error fetching conversation data:", error);
    }

  }


  navBack(){
    this.location.back();
  }

  // Initialize chat history if available
  setHistoryInit() {
    if (this.convDetail.length > 0) {
      for (const item of this.convDetail) {
        this.chatService.setHistory(item);
      }
    }
  }
}
