// src/app/services/file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface FilesResponse {
  content: any[];
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = "http://localhost:8080/subject";

  constructor(private http: HttpClient) {}


  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`,formData);
  }

  getFiles(currentPage:number,pageSize:number,searchTerm:string): Observable<FilesResponse> {
    return this.http.get<FilesResponse>(`${this.apiUrl}/get-all-files?${searchTerm ? `searchTerm=${searchTerm}&` : ''}page=${currentPage}&size=${pageSize}`);
  }

  deleteFile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {responseType: 'text'});
  }

  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' });
  }
}
