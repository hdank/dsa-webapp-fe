import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-general-dsa',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './general-dsa.component.html',
  styleUrl: './general-dsa.component.css'
})
export class GeneralDSAComponent implements OnInit{
  private baseUrl = "http://localhost:8080/user";
  imgPath= "/public/table.jpg"
  private displayHtml!: String;
  constructor(private http: HttpClient, private router: Router){}
  ngOnInit(): void {
    var token = localStorage.getItem('authToken');
    if(token !=null){
      console.log("General page");
      this.http.get(`${this.baseUrl}/general`, {responseType: 'text'}).pipe(
        map(response => response), 
        catchError(error => {console.error("Error occurred: ", error);
                             return of(null);
        })
      )
          .subscribe(response => {
            if(response){
              document.getElementById('graph')!.innerHTML = response.toString();
            }
            else {
              console.log('No response received or an error occurred.');
            }
          })
    }
    else{
      this.router.navigate(['/login']);
    }
    
  }
}
