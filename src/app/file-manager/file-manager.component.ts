import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from "../sidebar/sidebar.component";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {FileService} from "../../service/file-service";
import $ from "jquery";
import {AuthserviceService} from "../authservice.service";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

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
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    SidebarComponent,
    NgIf,
    NgForOf
  ],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.css'
})
export class FileManagerComponent implements OnInit {


  private baseUrl = "http://localhost:8080/subject";

  private userUrl = "http://localhost:8080/user";

  private flaskUrl = "http://127.0.0.1:5000";

  public role!: string;

  selectedFile!: File;

  imgPath= "/public/table.jpg"

  private displayHtml!: String;

  files:any[] =[];
  totalPages:number = 0;
  pagesArray: number[] = [];
  currentPage:number= 0;
  pageSize:number = 10;
  searchTerm: any = '';

  constructor(private http: HttpClient, private router: Router, private filesService: FileService, private authService:AuthserviceService){
    this.loadFiles(this.searchTerm);
    this.pagesArray = Array(this.totalPages).fill(0).map((_, index) => index);
  }

  ngOnInit() {
    window.onclick = (e:MouseEvent) =>{
      let uploadEl:HTMLElement = $('.upload-container')[0];
      let showBtn:HTMLElement = $('.showBtn')[0];
      if (uploadEl.contains(e.target as Node) || e.target == showBtn){
        return;
      }
      $(".upload-container").slideUp("fast");
    }
    //let token = localStorage.getItem('authToken');
    let token = this.authService.getToken();
    let parsedToken =  String(token);
    this.http.get<{role: string}>(`${this.userUrl}/is-admin-or-user`, {params: {token:parsedToken}}).subscribe(
      data=>{
        this.role = data.role;
      }
    );
  }

  showUpload(){
    $(".upload-container").slideToggle("fast");
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  loadFiles(searchTerm:any) {
    this.filesService.getFiles(this.currentPage,this.pageSize,searchTerm).subscribe((response:FilesResponse) => {
      this.files = response.content;
      this.totalPages = response.totalPages;
      console.log(this.files)
      console.log(this.totalPages)
    });
  }

  uploadFile() {
    //Check do upload file existed
    if(this.selectedFile){
      const formData: FormData = new FormData(); //Create form data for contain upload file
      formData.append('file', this.selectedFile);
      const headers = new HttpHeaders();
      let saveInfo;
      //Post file to flask
      this.http.post(`${this.flaskUrl}/pdf`,formData,{headers}).subscribe((response:any) => {
        //Get response file info
        saveInfo = {
          id: response.document_id,
          filename: response.filename
        }
        console.log("saveInfo",saveInfo)
        //Post and save file info to BE
        this.filesService.uploadFile(this.selectedFile).subscribe(()=>{
          //Clear upload content after done response
          $(".upload-container").slideUp("fast");
          $("#uploadFileInp").val("");
          alert('File uploaded successfully.')
          this.loadFiles(this.searchTerm);
        })
      })
    }else{
      //Not input file yet
      alert("You should to upload file first !")
    }
  }

  deleteFile(id: number) {
    this.filesService.deleteFile(id).subscribe(() => {
      alert('Đã xóa file');
      this.loadFiles(this.searchTerm);
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

  dateFormat(time:string){
    return new DatePipe('en-US').transform(time, 'dd/MM/yyyy HH:mm:ss')
  }

  setActivePage(pageNum:number){
    document.querySelectorAll(".page-item").forEach(page => {page.classList.remove("active");});
    document.querySelectorAll(".page-item")[pageNum].classList.add("active");
  }

  goToPage(pageNum:number){
    this.currentPage = pageNum;
    this.loadFiles(this.searchTerm);
    this.setActivePage(pageNum);
  }

  navPage(sign:string){
    if(sign == '-'){
      this.currentPage -= 1;
    }else if (sign == '+') {
      this.currentPage += 1;
    }
    this.loadFiles(this.searchTerm);
    this.setActivePage(this.currentPage);
  }

  search(){
    this.searchTerm = $("#searchInp").val();
    this.loadFiles(this.searchTerm);
  }
}
