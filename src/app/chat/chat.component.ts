import { Component, contentChild, model, OnInit, ViewEncapsulation } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Ollama } from 'ollama'
import {HumanMessage} from '@langchain/core/messages'
import { AIMessage } from '@langchain/core/messages';
interface ApiResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  encapsulation: ViewEncapsulation.None //apllying the css of the component to the insert element from user
})

export class ChatComponent implements OnInit {
  private apiUrl = "http://localhost:11434/api/generate";
  private count = 0;
  private chatHistory =[ {role: "system", content: "You are a helpful AI Assistant. Always answer in English."}];

  constructor(private router: Router, private http: HttpClient) { }
  
  ngOnInit(): void {
    var token = localStorage.getItem('authToken');
    if (token != null) {
      console.log("Chat page");
    }
    else {
      this.router.navigate(['/login']);
    }

  }

  async sendMessage() {
    var input = (<HTMLTextAreaElement>document.getElementById('textarea')).value;
    var now = new Date();
    if (input != null) {
      var div = document.createElement('div');
      var p = document.createElement('p');
      var time = document.createElement('p');
      p.innerHTML = input;
      time.innerHTML = now.toLocaleString();
      div.className = "message-box right";
      div.appendChild(time);
      div.appendChild(p);
      document.getElementById('messages-container')?.appendChild(div);
      (<HTMLTextAreaElement>document.getElementById('textarea')).value = "";

      //Response from bot
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      //Create a p tag after each input from user
      var p2 = document.createElement('p');
      p2.className = "response";
      var p2 = document.createElement('p');
      const llm = new Ollama({ host: 'http://127.0.0.1:11434' });
      p2.className = "response" + this.count;
      var div2 = document.createElement('div');
      var time2 = document.createElement('p');
      div2.className = "message-box left";
      var now = new Date();
      time2.innerHTML = now.toLocaleString();
      div2.appendChild(time2);
      div2.appendChild(p2);
      document.getElementById('messages-container')?.appendChild(div2);

      //Chat history store

      this.chatHistory.push(
        {role: 'user', content: input}
      )
      //Ollama call
      const response = await llm.chat(
        {
          model: 'llama3.1',
          messages: this.chatHistory,
          
          stream: true
        }
      )
      var tempResponse ='';
      for await (const r of response) {
        console.log(r.message.content);
        p2.innerHTML += r.message.content;
        tempResponse += r.message.content;
      }
      this.chatHistory.push({role: 'assistant', content:tempResponse})
      console.log(this.chatHistory)
    }
  }
}
