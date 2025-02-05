import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';
import {FileService} from "../../service/file-service";
import {NgForOf, NgIf} from "@angular/common";
import {AuthserviceService} from "../authservice.service";

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

@Component({
  selector: 'app-general-dsa',
  standalone: true,
  imports: [SidebarComponent, NgForOf, NgIf],
  templateUrl: './general-dsa.component.html',
  styleUrl: './general-dsa.component.css'
})

export class GeneralDSAComponent implements OnInit{
  private baseUrl = "http://localhost:8080/subject";

  private userUrl = "http://localhost:8080/user";

  public role!: string;

  files:any[] =[];
  currentPage:number= 0;
  pageSize:number = 10;
  searchTerm: any = '';

  constructor(private http: HttpClient, private router: Router, private filesService: FileService, private authService:AuthserviceService ){
    this.loadFiles();
  }


  ngOnInit(): void {
    //let token = localStorage.getItem('authToken');
    let token = this.authService.getToken();
    let parsedToken =  String(token);
    this.http.get<{role: string}>(`${this.userUrl}/is-admin-or-user`, {params: {token:parsedToken}}).subscribe(
      data=>{
        this.role = data.role;
      }
    );
    this.http.get(`${this.baseUrl}/general`, {responseType: 'text'}).pipe(
      map(response => response),
      catchError(error => {console.error("Error occurred: ", error);
        return of(null);}
      ))
      .subscribe(response => {
        if(response){
          console.log(response);
          document.getElementById('graph')!.innerHTML = response.toString();
        }
        else {
          console.log('No response received or an error occurred.');
        }
      })
  }


  loadFiles() {
    this.filesService.getFiles(this.currentPage,this.pageSize,this.searchTerm).subscribe(data => this.files = data.content);
  }

  downloadFile(id: number, filename: string) {
    this.filesService.downloadFile(id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    })
  }
}
