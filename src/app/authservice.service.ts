import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserComponent } from './user/user.component';
import { catchError, map, Observable, of } from 'rxjs';
import { tap } from 'rxjs';
import { LoginUserService } from './login-user.service';
import { Authresponse } from './authresponse';
import {environments} from "../environments/environments";
@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  private baseUrl=`${environments.API_JAVA_BE}/user`;

  constructor(private http: HttpClient, private router:Router,private loginUserService: LoginUserService){}
  private isAuthenticated = false;
  user: UserComponent = new UserComponent();

  userLogin(user: UserComponent) {
    return this.loginUserService.loginUser(user).pipe(catchError(()=> of(null)));
  }

  autoLogin(token:string): Observable<any>{
    const stringToken = String(token);
    return this.http.get(`${this.baseUrl}/auto-login?token=${stringToken}`)
            .pipe(catchError(()=>of(null)));
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  saveToken(token: string, mssv:string, role:string) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // Cookie sẽ hết hạn sau 1 ngày
    document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/`;
    document.cookie = `authMssv=${mssv}; expires=${expires.toUTCString()}; path=/`;
    document.cookie = `authRole=${role}; expires=${expires.toUTCString()}; path=/`;
  }

  getToken(): string {
    const name = 'authToken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  getMssv() {
    const name = "authMssv=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return ""; // Trả về rỗng nếu không tìm thấy
  }

  getRole() {
    const name = "authRole=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return ""; // Trả về rỗng nếu không tìm thấy
  }

  deleteToken() {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }


  validateToken(token: string): Observable<boolean> {
    // Implement logic to validate the token against your backend
    // Return an observable that emits true if valid, false otherwise
    return this.http.get<boolean>(`${this.baseUrl}/auto-login`, {params:{token} })
    .pipe(
      map(response => !!response),
      catchError(() => of(false))
    );
  }
}
