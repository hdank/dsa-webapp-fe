import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserComponent } from './user/user.component';
import { catchError, map, Observable, of } from 'rxjs';
import { Authresponse } from './authresponse';
import {environments} from "../environments/environments";
import {data} from "jquery";

@Injectable({
  providedIn: 'root'
})
export class LoginUserService {

  private baseUrl=`${environments.API_JAVA_BE}/user/login`;


  constructor(private httpClient: HttpClient) { }

  loginUser(user: UserComponent): Observable<any>{
    return this.httpClient.post<Authresponse>(`${this.baseUrl}`, user)
      .pipe(
        map(response=> response),
        catchError(() => of(""))
      )
  }
}
