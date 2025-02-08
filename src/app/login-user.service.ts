import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserComponent } from './user/user.component';
import { catchError, map, Observable, of } from 'rxjs';
import { Authresponse } from './authresponse';
import {environments} from "../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class LoginUserService {

  private baseUrl=`${environments.API_JAVA_BE}/login`;


  constructor(private httpClient: HttpClient) { }
  loginUser(user: UserComponent): Observable<string>{
    console.log(user);
    return this.httpClient.post<Authresponse>(`${this.baseUrl}`, user)
            .pipe(
              map(response=> response.token),
              catchError(() => of(""))
            )
  }
}
