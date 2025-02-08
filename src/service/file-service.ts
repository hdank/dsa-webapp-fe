// src/app/services/file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environments} from "../environments/environments";

// Interface to define the structure of the response when retrieving files
interface FilesResponse {
  content: any[];  // Array of file data
  totalPages: number;  // Total pages available for pagination
  totalElements: number;  // Total number of files available
  numberOfElements: number;  // Number of elements in the current page
  size: number;  // Size of the current page
  number: number;  // Current page number
  sort: {  // Sorting information
    sorted: boolean;  // Indicates if the data is sorted
    unsorted: boolean;  // Indicates if the data is unsorted
    empty: boolean;  // Indicates if the data is empty
  };
  empty: boolean;  // Indicates if the current page is empty
}

@Injectable({
  providedIn: 'root'  // Service is available throughout the application
})
export class FileService {
  // Base API URL for file operations
  private apiUrl = `${environments.API_JAVA_BE}/subject`;

  // Inject HttpClient to make HTTP requests
  constructor(private http: HttpClient) {}

  // Method to upload a file
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();  // FormData to handle file uploads
    formData.append('file', file);  // Append the file to the form data
    return this.http.post(`${this.apiUrl}/upload`, formData);  // POST request to upload the file
  }

  // Method to retrieve files with pagination and optional search term
  getFiles(currentPage: number, pageSize: number, searchTerm: string): Observable<FilesResponse> {
    // Construct the URL with optional search term and pagination
    return this.http.get<FilesResponse>(`${this.apiUrl}/get-all-files?${searchTerm ? `searchTerm=${searchTerm}&` : ''}page=${currentPage}&size=${pageSize}`);
  }

  // Method to delete a file by its ID
  deleteFile(id: number): Observable<any> {
    // DELETE request to remove the file with the given ID
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });  // Returns a text response
  }

  // Method to download a file by its ID
  downloadFile(id: number): Observable<Blob> {
    // GET request to fetch the file as a Blob
    return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' });  // Returns the file as a Blob
  }
}
