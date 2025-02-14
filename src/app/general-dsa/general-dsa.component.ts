import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';
import { FileService } from "../../service/file-service";
import { NgForOf, NgIf } from "@angular/common";
import { AuthserviceService } from "../authservice.service";
import {environments} from "../../environments/environments";

// Interface to define the structure of the response for file-related operations
interface FilesResponse {
  content: any[];  // List of file objects
  totalPages: number;  // Total number of pages for pagination
  totalElements: number;  // Total number of files available
  numberOfElements: number;  // Number of files on the current page
  size: number;  // Size of each page
  number: number;  // Current page number
  sort: {
    sorted: boolean;  // Whether the data is sorted
    unsorted: boolean;  // Whether the data is unsorted
    empty: boolean;  // Whether the data is empty
  };
  empty: boolean;  // Whether the content on the current page is empty
}

@Component({
  selector: 'app-general-dsa',
  standalone: true,  // This component is standalone
  imports: [SidebarComponent, NgForOf, NgIf],  // Import necessary modules and components
  templateUrl: './general-dsa.component.html',  // Path to the HTML template
  styleUrl: './general-dsa.component.css'  // Path to the component's CSS
})

export class GeneralDSAComponent implements OnInit {
  private baseUrl = `${environments.API_JAVA_BE}/subject`;  // API endpoint for subject-related requests
  private userUrl = `${environments.API_JAVA_BE}/user`;  // API endpoint for user-related requests

  public role!: string;  // User's role (admin or user)

  files: any[] = [];  // Array to store the list of files
  currentPage: number = 0;  // Current page for pagination
  pageSize: number = 10;  // Number of items per page
  searchTerm: any = '';  // Search term for filtering files

  constructor(
    private http: HttpClient,
    private router: Router,
    private filesService: FileService,
    private authService: AuthserviceService
  ) {
    this.loadFiles();  // Initial load of files
  }

  ngOnInit(): void {
    // Retrieve the user's token to verify their role (admin or user)
    let token = this.authService.getToken();
    let parsedToken = String(token);

    // Send a request to get the role of the current user (admin or user)
    this.http.get<{ role: string }>(`${this.userUrl}/is-admin-or-user`, { params: { token: parsedToken } })
      .subscribe(data => {
        this.role = data.role;  // Set the user's role
      });

    // Fetch data for the general DSA and display it in the graph container
    this.http.get(`${this.baseUrl}/general`, { responseType: 'text' }).pipe(
      map(response => response),  // Map the response (in this case, it's text)
      catchError(error => {
        console.error("Error occurred: ", error);  // Handle errors if they occur
        return of(null);  // Return a null observable to prevent breaking the flow
      })
    ).subscribe(response => {
      // If response is valid, update the content of the 'graph' element
      if (response) {
        document.getElementById('graph')!.innerHTML = response.toString();  // Insert the response into the 'graph' element
      } else {
        console.log('No response received or an error occurred.');  // Log if no response is received or an error occurs
      }
    });
  }

  // Load the files based on the current page, page size, and search term
  loadFiles() {
    this.filesService.getFiles(this.currentPage, this.pageSize, this.searchTerm).subscribe((response:any) => {
      this.files = response;  // Store the fetched files into the 'files' array
    });
  }

  // Handle file download based on file ID and filename
  downloadFile(id: number, filename: string) {
    this.filesService.downloadFile(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);  // Create a URL for the file blob
      const a = document.createElement('a');  // Create a temporary anchor element
      a.href = url;  // Set the file URL as the anchor's href
      a.download = filename;  // Set the filename for the download
      a.click();  // Trigger the download by simulating a click on the anchor element
    });
  }
}
