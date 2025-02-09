import { Component, OnInit } from '@angular/core';
import { UserComponent } from '../user/user.component';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoginUserService } from '../login-user.service';
import { SharedModuleComponent } from '../shared-module/shared-module.component';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthserviceService } from '../authservice.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, SharedModuleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {

  user: UserComponent = new UserComponent();

  constructor(private authService: AuthserviceService, private router: Router) {}
  ngOnInit(): void {
    // If the token exists => auto login
    const token = this.authService.getToken();
    if(token){
      const stringToken = String(token);
      this.authService.autoLogin(stringToken).subscribe(user=>{
        if(user){
          this.router.navigate(['/chat']);
        }
      })
    }

  document.querySelector(".frame-left")?.classList.add("show");
  }


  navigateToSignUp(){
    this.router.navigate(['/sign-up']);
  }

  userLogin() {
    this.authService.userLogin(this.user).subscribe(response=>{
      console.log(response)
      if(response){
        const tokenString = String(response.token);
        const mssvString = String(response.mssv);
        const roleString = String(response.role);
        this.authService.saveToken(tokenString,mssvString,roleString);
        this.router.navigate(['/chat']);
      }else{
        alert("Please enter mssv and password correctly");
      }
    })
  }
}
