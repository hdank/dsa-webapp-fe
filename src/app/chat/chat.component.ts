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
import { catchError, of } from 'rxjs';
interface ApiResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  choices: Array<{ message: { role: string; content: string } }>; // Updated typing for choices
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
  private count = 0;
  private chatHistory =[ {role: "system", content: "Bạn là một giảng viên đại học giải thích về thuật toán được người dùng nhập vào trong môn học cấu trúc dữ liệu và giải thuật cho người mới học lập trình. Khi được hỏi, bạn trả lời về khái niệm và ví dụ về thuật toán mà bạn được người dùng nhập vào."}];
  private apiUrl = "http://localhost:1234/v1/chat/completions";
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
      const llm = new Ollama({ host: 'http://localhost:1234' });
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
      // const response = await llm.chat(
      //   {
      //     model: 'dsa',
      //     messages: this.chatHistory,
          
      //     stream: true
      //   }
      // )
      this.http.post<ApiResponse>(this.apiUrl, { model: "dsa", messages: this.chatHistory, stream: false }, { headers })
        .pipe(
          catchError(err => {
            console.error('Error occurred:', err);
            return of(null); // Handle error and return empty observable
          })
        )
        .subscribe(async (response: ApiResponse | null) => {
          if (response && response.choices && response.choices[0] && response.choices[0].message) {
            p2.innerHTML = response.choices[0].message.content; // Display the bot's message
            this.chatHistory.push({ role: 'assistant', content: response.choices[0].message.content });
            console.log(this.chatHistory);
          } else {
            p2.innerHTML = "Error: Could not retrieve response.";
          }
        });
      // var tempResponse ='';
      // for await (const r of response) {
      //   console.log(r.message.content);
      //   p2.innerHTML += r.message.content;
      //   tempResponse += r.message.content;
      // }
      // this.chatHistory.push({role: 'assistant', content:tempResponse})
      console.log(this.chatHistory)
    }
  }
}
