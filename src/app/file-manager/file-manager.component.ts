import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { FileService } from "../../service/file-service";
import $ from "jquery";
import { AuthserviceService } from "../authservice.service";
import {environments} from "../../environments/environments";

// Interface to define the structure of the response for file-related operations
interface FilesResponse {
  content: any[];  // The content of the files
  totalPages: number;  // Total number of pages for pagination
  totalElements: number;  // Total number of elements (files)
  numberOfElements: number;  // Number of elements in the current page
  size: number;  // Size of the current page
  number: number;  // Current page number
  sort: {
    sorted: boolean;  // Whether the data is sorted
    unsorted: boolean;  // Whether the data is unsorted
    empty: boolean;  // Whether the data is empty
  };
  empty: boolean;  // Whether the current page has any content
}

@Component({
  selector: 'app-file-manager',
  standalone: true,  // This component is a standalone component
  imports: [
    SidebarComponent,
    NgIf,
    NgForOf  // Import necessary modules and components
  ],
  templateUrl: './file-manager.component.html',  // Path to the HTML template
  styleUrl: './file-manager.component.scss'  // Path to the component's CSS
})
export class FileManagerComponent implements OnInit {

  // API base URLs for different services
  private userUrl = `${environments.API_JAVA_BE}/user`;
  private flaskUrl = `${environments.API_FLASK_BE}`;

  public role!: string;  // User role (admin or user)
  selectedFile!: File;  // Selected file for upload

  // Pagination and file data
  files: any[] = [];
  totalPages: number = 0;
  pagesArray: number[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  searchTerm: any = '';  // Search term for filtering files
  uploading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private filesService: FileService,
    private authService: AuthserviceService
  ) {
    // Load files when component is initialized
    this.loadFiles(this.searchTerm);
  }

  ngOnInit() {
    // Handle click event to close the upload container when clicked outside
    window.onclick = (e: MouseEvent) => {
      let uploadEl: HTMLElement = $('.upload-container')[0];
      let showBtn: HTMLElement = $('.showBtn')[0];
      if (!uploadEl){
        return;
      }
      if (uploadEl?.contains(e.target as Node) || e.target == showBtn) {
        return;
      }
      $(".upload-container").slideUp("fast");
    }

    // Get the user role based on the token
    let token = this.authService.getToken();
    let parsedToken = String(token);
    this.http.get<{ role: string }>(`${this.userUrl}/is-admin-or-user`, { params: { token: parsedToken } }).subscribe(
      data => {
        this.role = data.role;  // Set the user role
      }
    );
  }

  // Toggle visibility of the upload container
  showUpload() {
    $(".upload-container").slideToggle("fast");
  }

  // Handle file selection for upload
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];  // Store selected file
  }

  // Load files with optional search term
  loadFiles(searchTerm: any) {
    this.filesService.getFiles(this.currentPage, this.pageSize, searchTerm).subscribe((response: any) => {
      this.files = response.content;  // Store the files data
      this.totalPages = response.totalPages;  // Store the total number of pages
      this.pagesArray = Array(this.totalPages).fill(0).map((_, index) => index);
    });
  }

  // Upload selected file
  uploadFile() {
    this.uploading = true;
    // Check if a file is selected
    if (this.selectedFile) {
      const formData: FormData = new FormData();  // Create FormData to hold the selected file
      formData.append('file', this.selectedFile);  // Append the file to formData
      const headers = new HttpHeaders();  // Create HTTP headers (if needed)
      let saveInfo;
      // Post file to Flask server for processing
      this.http.post(`${this.flaskUrl}/pdf`, formData, { headers }).subscribe((response: any) => {
        // Get response with file info
        saveInfo = {
          id: response.document_id,
          filename: response.filename
        };

        // Save file info to the backend server
        this.filesService.uploadFile(this.selectedFile).subscribe(() => {
          // Clear upload input and close upload container after success
          $(".upload-container").slideUp("fast");
          $("#uploadFileInp").val("");  // Clear file input
          this.uploading = false;
          alert('File uploaded successfully.');  // Alert user about successful upload
          this.loadFiles(this.searchTerm);  // Reload files list after upload
        });
      });
    } else {
      // Alert if no file is selected
      alert("You should upload a file first!");
    }
  }

  // Delete a file based on its ID
  deleteFile(id: number) {
    this.filesService.deleteFile(id).subscribe(() => {
      alert('File deleted successfully.');  // Alert user about successful file deletion
      this.loadFiles(this.searchTerm);  // Reload files list after deletion
    });
  }

  // Download file based on its ID and filename
  downloadFile(id: number, filename: string) {
    this.filesService.downloadFile(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);  // Create an object URL for the file blob
      const a = document.createElement('a');  // Create an anchor element
      a.href = url;  // Set the href to the file URL
      a.download = filename;  // Set the download attribute with the file's filename
      a.click();  // Trigger the download
    });
  }

  // Format the date using DatePipe
  dateFormat(time: string) {
    return new DatePipe('en-US').transform(time, 'dd/MM/yyyy HH:mm:ss');  // Format the date string
  }

  // Set the active page for pagination
  setActivePage(pageNum: number) {
    document.querySelectorAll(".page-item").forEach(page => {
      page.classList.remove("active");  // Remove active class from all pages
    });
    document.querySelectorAll(".page-item")[pageNum].classList.add("active");  // Add active class to the selected page
  }

  // Navigate to a specific page in the file list
  goToPage(pageNum: number) {
    this.currentPage = pageNum;  // Set the current page number
    this.loadFiles(this.searchTerm);  // Reload files for the selected page
    this.setActivePage(pageNum);  // Set the selected page as active
  }

  // Navigate to the previous or next page
  navPage(sign: string) {
    if (sign == '-') {
      this.currentPage -= 1;  // Decrease page number (previous)
    } else if (sign == '+') {
      this.currentPage += 1;  // Increase page number (next)
    }
    this.loadFiles(this.searchTerm);  // Reload files for the new page
    this.setActivePage(this.currentPage);  // Set the new page as active
  }

  // Search files based on the search input value
  search() {
    this.searchTerm = $("#searchInp").val();  // Get search input value
    this.loadFiles(this.searchTerm);  // Reload files based on the search term
  }
}
