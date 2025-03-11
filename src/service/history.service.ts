import { Injectable } from '@angular/core';
import { BehaviorSubject  } from 'rxjs';
import {environments} from "../environments/environments";
import {AuthserviceService} from "../app/authservice.service";

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  extendHisBar = false;
  historyConv:any = []
  constructor(private authservice:AuthserviceService) { }

  setExtendHis(isShow:boolean) {
    this.extendHisBar = isShow;
  }

  setHistoryConv(data:any){
    this.historyConv = data
  }

  async fetchConversation() {
    let userId = this.authservice.getMssv()
    // Fetch conversations from the backend
    await fetch(`${environments.API_JAVA_BE}/user/get-conversations?id=${userId}`)
      .then(response => response.json())
      .then(data => {
        this.setHistoryConv(data.sort((a:any, b:any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()));  // Store conversation history
      });
  }
}
