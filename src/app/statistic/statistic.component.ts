import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from "../sidebar/sidebar.component";
import {HttpClient} from "@angular/common/http";
import {UserComponent} from "../user/user.component";
import {DatePipe, NgForOf} from "@angular/common";
import {Chat} from "../chat";

interface UserChat {
  user: UserComponent;
  chats: Chat[];
}
@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [SidebarComponent, NgForOf, DatePipe],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.css'
})
export class StatisticComponent implements OnInit{
  private userUrl = "http://localhost:8080/user";
  users!: UserComponent[];
  chats!: Chat[];
  userChats!: UserChat[];
  constructor(private http: HttpClient) {
  }
  ngOnInit(): void {
    // Get all users information
    this.http.get<UserComponent[]>(`${this.userUrl}/get-all-user`).subscribe((data) => {
        this.users = data;

        // Now that users are loaded, get all the chat of users
        this.http.get<Chat[]>(`${this.userUrl}/get-all-user-chat`).subscribe((chatData) => {
            this.chats = chatData;
            this.userChats = this.users.map(user => ({
              user,
              chats: this.chats.filter(chat => chat.user_id === user.mssv)
            }));
          },
          error => { console.log(error); });
      },
      error => { console.log(error); });
  }

}
