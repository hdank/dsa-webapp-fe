import { Injectable } from '@angular/core';
import { AuthserviceService } from './authservice.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService implements CanActivate{

  http!: HttpClient;
  constructor(private router: Router,private authService: AuthserviceService){}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>{
    //const token = localStorage.getItem('token');
    const token = this.authService.getToken();
    if (token) {
      return this.authService.validateToken(token).pipe(
        map((isValid: any) => {
          if (isValid) {
            return true;
          } else {
            this.router.navigate(['/login']);
            return false;
          }
        }),
        catchError(() => {
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    } else {
      this.router.navigate(['/login']);
      return of(false);
    }
  }
}
