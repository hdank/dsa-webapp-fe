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
  imports: [NgFor, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  encapsulation: ViewEncapsulation.None //apllying the css of the component to the insert element from user
})

export class ChatComponent implements OnInit {
  private count = 0;
  private chatHistory =[{}];
  private apiUrl = "http://localhost:8080/api/conversation";
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


      //Create a p tag after each input from user
      var p2 = document.createElement('p');
      p2.className = "response";
      const llm = new Ollama({ host: 'http://localhost:1234' });
      p2.className = "response" + this.count;
      var div2 = document.createElement('div');
      var time2 = document.createElement('p');
      div2.className = "message-box left";
      var now2 = new Date();
      time2.innerHTML = now2.toLocaleString();
      div2.appendChild(time2);
      div2.appendChild(p2);
      document.getElementById('messages-container')?.appendChild(div2);

      //Chat history store
      this.chatHistory.pop()
      this.chatHistory.push(
        {role: 'user', content: input}
      )
      const payload = {messages: this.chatHistory};
      const token = localStorage.getItem('authToken');
      this.http.post<ApiResponse[]>(`${this.apiUrl}?token=${token}`, payload)
        .pipe(
          catchError(err => {
            console.error('Error occurred:', err);
            return of(null); // Handle error and return empty observable
          })
        )
        .subscribe(async (responseArray: ApiResponse[] | null) => {
          if (responseArray && responseArray.length > 0) {
            const response = responseArray[0]; // Access the first object in the array
            if (response.choices && response.choices[0] && response.choices[0].message) {
              p2.innerHTML = response.choices[0].message.content; // Display the bot's message
              this.chatHistory.push({ role: 'assistant', content: response.choices[0].message.content });
              console.log(this.chatHistory);
            } else {
              p2.innerHTML = "Error: Could not retrieve response.";
            }
          } else {
            p2.innerHTML = "Error: Invalid response from server.";
          }
        });

      console.log(this.chatHistory)
    }
  }
}
