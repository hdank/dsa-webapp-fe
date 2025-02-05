import { Component, contentChild, model, OnInit, ViewEncapsulation } from '@angular/core';
import {NgClass, NgFor} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthserviceService } from "../authservice.service";
import { SpeechService } from "../../service/speech.service";
import {ChatService} from "../../service/chat.service";

interface ApiResponse {
  id: string,
  object: string,
  created_at: string;
  model: string;
  done: boolean;
  choices: Array<{index: number , message: { role: string; content: string } }>; // Updated typing for choices
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, FormsModule, SidebarComponent, NavbarComponent, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  encapsulation: ViewEncapsulation.None //apllying the css of the component to the insert element from user
})

export class ChatComponent implements OnInit {
  private chatHistory =[{}];
  private apiUrl = "http://localhost:8080/api/conversation";
  isRecording = false;
  isSending = false;
  content: any;


  constructor(private router: Router, private http: HttpClient , private authService:AuthserviceService , private speechService:SpeechService , private chatService:ChatService) {
  }

  helloWord(){
    var div = document.createElement('div');
    var p = document.createElement('p');
    var time = document.createElement('p');
    let messageTime = new Date();
    p.innerHTML = "Chào bạn , mình là ChatBot"
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    div.className = "message-box left";
    div.appendChild(time);
    div.appendChild(p);
    document.getElementById('messages-container')?.appendChild(div);
  }

  ngOnInit(): void {
    //var token = localStorage.getItem('authToken');
    const token = this.authService.getToken();
    if (token != null) {
      console.log("Chat page");
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  clearAttached(){
    this.chatService.clearAttached()
  }

  onImageAttached(event: any) {
    this.chatService.setImageAttached(event.target.files[0])
  }

  // Define a function to read the content
  /*readMessage = (message: "" | null | string) => {
    this.chatService.textSpeeching(message)
  };*/

  /*serverResponse(query:string){
    this.chatService.serverResponse(query)
  };*/

  sendMessage() {
    //isRecording == true => speeching => stop
    if (this.isRecording) {
      this.isRecording = false
      this.speechService.stopRecognition();
    }
    //Set sending status for disable sending and speeching button make delay for stop speeching completely
    this.isSending = true;
    setTimeout(() => {this.isSending = false;}, 1000);
    this.chatService.sendMessage()
  };

  stopRecord(){
    this.isRecording = false;
    this.speechService.stopRecognition();
  }

  startRecord(): void {
    this.isRecording = true;
    this.speechService.startRecognition();
  }
}
