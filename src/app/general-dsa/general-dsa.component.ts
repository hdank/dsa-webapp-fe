import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';
import {FileService} from "../../file-service";
import {NgForOf, NgIf} from "@angular/common";

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

  selectedFile!: File;

  imgPath= "/public/table.jpg"

  private displayHtml!: String;

  files:any[] =[];

  constructor(private http: HttpClient, private router: Router, private filesService: FileService){
    this.loadFiles();
  }


  ngOnInit(): void {
    let token = localStorage.getItem('authToken');
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
          document.getElementById('graph')!.innerHTML = response.toString();
        }
        else {
          console.log('No response received or an error occurred.');
        }
      })
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  loadFiles() {
    this.filesService.getFiles().subscribe(data => this.files = data);
  }

  uploadFile() {
    if(this.selectedFile){
      this.filesService.uploadFile(this.selectedFile).subscribe(() => {
        alert('File uploaded successfully.');
        this.loadFiles();
      })
    }
  }

  deleteFile(id: number) {
    this.filesService.deleteFile(id).subscribe(() => {
      alert('Đã xóa file');
      this.loadFiles();
    })
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
