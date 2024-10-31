import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, interval, window, map, take, mergeAll } from 'rxjs'
@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.css'
})
export class LandingpageComponent implements OnInit {
  constructor(private router: Router){}
  navigateToLogin(){
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    var eyes = document.querySelector('.intro--robot--eye--container') as HTMLElement;
    document.onmousemove = (event) => {
        // get x and y postion of cursor
        var rect = eyes.getBoundingClientRect();
        var x = (event.pageX - rect.left) / 100 + "px";
        var y = (event.pageY - rect.top) / 100 + "px";

      console.log("x",x);
      console.log("y",y);
        eyes.style.transform = "translate3d(" + x + "," + y + ", 0px)";
    }
  }
}
