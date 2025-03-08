import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,  // Giữ lại tất cả các providers từ appConfig
    importProvidersFrom(BrowserAnimationsModule),  // Thêm BrowserAnimationsModule ở đây
  ]
})
  .catch((err) => console.error(err));
