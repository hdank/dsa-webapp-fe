import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HttpClient } from "@angular/common/http";
import { UserComponent } from "../user/user.component";
import { DatePipe, NgForOf } from "@angular/common";
import { Chat } from "../chat";
import $ from "jquery";
import { AuthserviceService } from "../authservice.service";

// Interface to store user and their associated chat history
interface UserChat {
  user: UserComponent;
  chats: Chat[];
}

@Component({
  selector: 'app-statistic',
  standalone: true,  // The component is standalone
  imports: [SidebarComponent, NgForOf],  // Import necessary components and modules
  templateUrl: './statistic.component.html',  // Path to the HTML template
  styleUrl: './statistic.component.css'  // Path to the component's CSS
})
export class StatisticComponent implements OnInit {
  private userUrl = "http://localhost:8080/user";  // API URL for user-related operations
  public role!: string;  // Role of the current user (admin/user)
  users!: UserComponent[];  // Array to hold all users
  chats!: Chat[];  // Array to hold all chat data
  userChats!: UserChat[];  // Array to associate users with their chat data
  totalPages: any[] = [];  // Array to store the total pages for pagination
  currentPage: number = 1;  // Current page for pagination
  pageSize: number = 10;  // Number of items per page
  pageStart: number = (this.currentPage - 1) * this.pageSize;  // Starting index of the page
  pageEnd: number = this.currentPage * this.pageSize;  // Ending index of the page
  searchingKey: string | number | string[] | undefined = '';  // Key for searching/filtering users

  constructor(private http: HttpClient, private authService: AuthserviceService) {
    this.loadUsers(this.searchingKey);  // Load users when the component is constructed
  }

  ngOnInit(): void {
    // Fetch the token from the Authservice
    let token = this.authService.getToken();
    let parsedToken = String(token);

    // Get the role of the current user (admin or user)
    this.http.get<{ role: string }>(`${this.userUrl}/is-admin-or-user`, { params: { token: parsedToken } })
      .subscribe(data => {
        this.role = data.role;  // Set the role of the user
        console.log(this.role);  // Log the role for debugging purposes
      });
  }

  // Load all users and filter them based on the searching key
  loadUsers(searchingKey: any) {
    // Get all users information from the backend
    this.http.get<UserComponent[]>(`${this.userUrl}/get-all-user`).subscribe((data) => {
        searchingKey = searchingKey.toLowerCase();  // Convert searching key to lowercase

        // Filter users based on the searching key
        searchingKey = ''
          ? this.users = data  // If the search key is empty, display all users
          : this.users = data.filter(item => item.mssv == searchingKey || (item.fname.toLowerCase() + " " + item.lname.toLowerCase()).includes(searchingKey));

        // Set the total pages based on the number of users and the page size
        this.totalPages = new Array(Math.ceil(this.users.length / this.pageSize));

        // Once users are loaded, fetch all the chats associated with these users
        this.http.get<Chat[]>(`${this.userUrl}/get-all-user-chat`).subscribe((chatData) => {
            this.chats = chatData;  // Store chat data
            // Map each user to their respective chat history
            this.userChats = this.users.map(user => ({
              user,
              chats: this.chats.filter(chat => chat.user_id === user.mssv)  // Filter chats by user ID
            }));
          },
          error => {
            console.log(error);  // Handle errors while fetching chat data
          });
      },
      error => {
        console.log(error);  // Handle errors while fetching user data
      });
  }

  // Set the active page in pagination
  setActivePage(pageNum: number) {
    // Remove the 'active' class from all pages
    document.querySelectorAll(".page-item").forEach(page => { page.classList.remove("active"); });

    // Add the 'active' class to the selected page
    document.querySelectorAll(".page-item")[pageNum].classList.add("active");
  }

  // Reload the current page based on the pagination values
  reloadPage() {
    this.pageStart = (this.currentPage - 1) * this.pageSize;  // Update the start index of the page
    this.pageEnd = this.currentPage * this.pageSize;  // Update the end index of the page
  }

  // Go to a specific page in the pagination
  goToPage(pageNum: number) {
    this.currentPage = pageNum;  // Set the current page
    this.reloadPage();  // Reload the page based on the new page number
    this.setActivePage(pageNum);  // Update the active page in the pagination
  }

  // Navigate to the next or previous page based on the sign ('+' or '-')
  navPage(sign: string) {
    if (sign == '-') {
      this.currentPage -= 1;  // Decrease the current page number
    } else if (sign == '+') {
      this.currentPage += 1;  // Increase the current page number
    }
    this.reloadPage();  // Reload the page
    this.setActivePage(this.currentPage);  // Update the active page
  }

  // Perform a search based on the user input
  search() {
    this.searchingKey = $("#searchInp").val();  // Get the search term from the input field
    this.loadUsers(this.searchingKey);  // Reload users based on the search term
  }
}
