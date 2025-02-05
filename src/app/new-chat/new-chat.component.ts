import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {SidebarComponent} from "../sidebar/sidebar.component";

@Component({
  selector: 'app-new-chat',
  standalone: true,
    imports: [
        FormsModule,
        SidebarComponent
    ],
  templateUrl: './new-chat.component.html',
  styleUrl: './new-chat.component.css'
})
export class NewChatComponent {

}
