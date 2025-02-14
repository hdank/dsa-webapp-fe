import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserComponent } from '../user/user.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Authresponse } from '../authresponse';
import { catchError, map, Observable, of } from 'rxjs';
import {environments} from "../../environments/environments";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  user: UserComponent = new UserComponent();
  private baseUrl=`${environments.API_JAVA_BE}/user/sign-up`;
  checkPassword(){
    var message = document.getElementById('message');
    var password = (<HTMLInputElement>document.getElementById('pwd'))!.value;
    var confirmPassword = (<HTMLInputElement>document.getElementById('confirm_pwd'))!.value;
    if(password == confirmPassword){
      message!.style.color ='green';
      message!.innerHTML ='Trùng khớp';
    }
    else{
      message!!.innerHTML ='Không trùng khớp';
      message!!.style.color='red';
    }
  }
  constructor(private router:Router, private http: HttpClient){}
  signUp(){
    this.http.post<Authresponse>(`${this.baseUrl}`,this.user)
        .pipe(
          map(response => response),
          catchError(()=> of(""))
        )
        .subscribe((response) => {
          if(response){
            this.router.navigate(['/login'])
          }
          else{
            console.log("Sign up failed");
          }
        })
  }
}
