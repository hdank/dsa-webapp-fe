import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from "../sidebar/sidebar.component";
import {HttpClient} from "@angular/common/http";
import {UserComponent} from "../user/user.component";
import {DatePipe, NgForOf} from "@angular/common";
import {Chat} from "../chat";
import $ from "jquery";
import {AuthserviceService} from "../authservice.service";

interface UserChat {
  user: UserComponent;
  chats: Chat[];
}
@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [SidebarComponent, NgForOf],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.css'
})
export class StatisticComponent implements OnInit{
  private userUrl = "http://localhost:8080/user";
  public role!: string;
  users!: UserComponent[];
  chats!: Chat[];
  userChats!: UserChat[];
  totalPages:any[] = [];
  currentPage:number= 1;
  pageSize:number = 10;
  pageStart:number = (this.currentPage - 1 ) * this.pageSize;
  pageEnd:number = this.currentPage * this.pageSize;
  searchingKey: string | number | string[] | undefined = '';
  constructor(private http: HttpClient , private authService:AuthserviceService) {
    this.loadUsers(this.searchingKey)
  }
  ngOnInit(): void {
    //let token = localStorage.getItem('authToken');
    let token = this.authService.getToken();
    let parsedToken =  String(token);
    this.http.get<{role: string}>(`${this.userUrl}/is-admin-or-user`, {params: {token:parsedToken}}).subscribe(
      data=>{
        this.role = data.role;
        console.log(this.role);
      }
    );
  }

  loadUsers(searchingKey:any){
    // Get all users information
    this.http.get<UserComponent[]>(`${this.userUrl}/get-all-user`).subscribe((data) => {
      searchingKey = searchingKey.toLowerCase();
      searchingKey = ''
          ? this.users = data
          : this.users = data.filter(item => item.mssv == searchingKey || (item.fname.toLowerCase() +" "+ item.lname.toLowerCase()).includes(searchingKey))
        this.totalPages = new Array(Math.ceil(this.users.length/this.pageSize));
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

  setActivePage(pageNum:number){
    document.querySelectorAll(".page-item").forEach(page => {page.classList.remove("active");});
    document.querySelectorAll(".page-item")[pageNum].classList.add("active");
  }

  reloadPage(){
    this.pageStart = (this.currentPage - 1) * this.pageSize;
    this.pageEnd = this.currentPage * this.pageSize;
  }

  goToPage(pageNum:number){
    this.currentPage = pageNum;
    this.reloadPage();
    this.setActivePage(pageNum);
  }

  navPage(sign:string){
    if(sign == '-'){
      this.currentPage -= 1;
    }else if (sign == '+') {
      this.currentPage += 1;
    }
    this.reloadPage();
    this.setActivePage(this.currentPage);
  }

  search(){
    this.searchingKey = $("#searchInp").val();
    this.loadUsers(this.searchingKey);
  }
}
