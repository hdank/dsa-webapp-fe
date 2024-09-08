import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-shared-module',
  standalone: true,
  imports: [BrowserModule, HttpClientModule],
  templateUrl: './shared-module.component.html',
  styleUrl: './shared-module.component.css'
})
export class SharedModuleComponent {

}
