import {Component, OnInit} from '@angular/core';
import {SidebarComponent} from "../sidebar/sidebar.component";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {FileService} from "../../file-service";
import $ from "jquery";

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

  public role!: string;

  selectedFile!: File;

  imgPath= "/public/table.jpg"

  private displayHtml!: String;

  files:any[] =[];
  totalPages:any[] = [];
  currentPage:number= 1;
  pageSize:number = 5;
  pageStart:number = (this.currentPage - 1 ) * this.pageSize;
  pageEnd:number = this.currentPage * this.pageSize;
  searchingKey: string | number | string[] | undefined = '';

  constructor(private http: HttpClient, private router: Router, private filesService: FileService){
    this.loadFiles(this.searchingKey);
  }
  ngOnInit() {
    window.onclick = (e:MouseEvent) =>{
      let uploadEl:HTMLElement = $('.upload-container')[0];
      let showBtn:HTMLElement = $('.showBtn')[0];
      console.log(uploadEl)
      if (uploadEl.contains(e.target as Node) || e.target == showBtn){
        return;
      }
      $(".upload-container").slideUp("fast");
    }
    let token = localStorage.getItem('authToken');
    let parsedToken =  String(token);
    this.http.get<{role: string}>(`${this.userUrl}/is-admin-or-user`, {params: {token:parsedToken}}).subscribe(
      data=>{
        this.role = data.role;
      }
    );
    console.log(this.role);
  }

  showUpload(){
    $(".upload-container").slideToggle("fast");
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  loadFiles(searchingKey:any) {
    this.filesService.getFiles().subscribe(data => {
      if (searchingKey == '') {
        this.files = data;
      }else{
        this.files = data.filter(item => item.id == searchingKey || item.fileName.includes(searchingKey));
      }
      this.totalPages = new Array(Math.ceil(this.files.length/this.pageSize));
    });
  }

  uploadFile() {
    if(this.selectedFile){
      this.filesService.uploadFile(this.selectedFile).subscribe(() => {
        alert('File uploaded successfully.');
        $(".upload-container").slideUp("fast");
        $("#uploadFileInp").val("");
        this.loadFiles(this.searchingKey);
      })
    }
  }

  deleteFile(id: number) {
    this.filesService.deleteFile(id).subscribe(() => {
      alert('Đã xóa file');
      this.loadFiles(this.searchingKey);
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
    const formattedDate = new DatePipe('en-US').transform(time, 'dd/MM/yyyy HH:mm:ss');
    return formattedDate
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
    this.loadFiles(this.searchingKey);
  }
}
