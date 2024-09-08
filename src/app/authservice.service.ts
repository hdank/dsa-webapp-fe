import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserComponent } from './user/user.component';
import { catchError, map, Observable, of } from 'rxjs';
import { tap } from 'rxjs';
import { LoginUserService } from './login-user.service';
import { Authresponse } from './authresponse';
@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  private baseUrl="http://localhost:8080/user";

  constructor(private http: HttpClient, private router:Router,private loginUserService: LoginUserService){}
  private isAuthenticated = false;
  user: UserComponent = new UserComponent();
  userLogin(user: UserComponent) {
    return this.loginUserService.loginUser(user).pipe(catchError(()=> of(null)));
  }

  autoLogin(token:string): Observable<any>{
    const stringToken = String(token);
    console.log("Sending token:", stringToken);
    return this.http.get(`${this.baseUrl}/auto-login?token=${stringToken}`)
            .pipe(catchError(()=>of(null)));
  }

  Logout(){
    const stringToken = localStorage.getItem('authToken');
    console.log("Log out function clicked");
    if (stringToken) {
        this.http.get(`${this.baseUrl}/logout?token=${stringToken}`).subscribe(() => {
            localStorage.clear();  // Clear local storage after server-side logout
            this.router.navigate(['/login']);  // Redirect to login page
        }, error => {
            console.error("Logout failed", error);  // Handle any logout errors
            this.router.navigate(['/login']);  // Still redirect to login page
        });
    } else {
        this.router.navigate(['/login']);  // If no token, simply redirect to login
    }
  }
  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }
  validateToken(token: string): Observable<boolean> {
    // Implement logic to validate the token against your backend
    // Return an observable that emits true if valid, false otherwise
    return this.http.get<boolean>('http://localhost:8080/user/auto-login', {params:{token} })
    .pipe(
      map(response => !!response),
      catchError(() => of(false))
    );
  }
}
