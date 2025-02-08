import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Router } from "@angular/router";
import { AuthserviceService } from "../authservice.service";
import { SpeechService } from "../../service/speech.service";
import { ChatService } from "../../service/chat.service";
import { DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [
    FormsModule,
    SidebarComponent,
    NgClass,
    NgForOf,
    NgIf
  ],
  templateUrl: './new-chat.component.html',
  styleUrl: '../chat/chat.component.scss'
})
export class NewChatComponent {
  isRecording = false;  // Flag to check if recording is in progress
  isSending = false;    // Flag to check if the message is being sent
  public convHistory: any[] = []  // Array to store conversation history

  // Constructor to inject services
  constructor(
    private router: Router,
    private authService: AuthserviceService,
    private speechService: SpeechService,
    private chatService: ChatService
  ) { }

  // On component initialization, check token and fetch conversation history
  ngOnInit(): void {
    const token = this.authService.getToken();  // Get the authentication token
    if (token != null) {  // If token exists, continue
      console.log("Chat page");
    } else {
      this.router.navigate(['/login']);  // Redirect to login page if no token
    }

    // Fetch conversations from the backend
    fetch(`http://localhost:8080/user/get-conversations?token=${token}`)
      .then(response => response.json())
      .then(data => {
        this.convHistory = data;  // Store conversation history
      });

    console.log("this.convHistory", this.convHistory);  // Log for debugging purposes
  }

  // Handle key press event for sending message when Enter key is pressed
  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode == 13) {  // If Enter key is pressed
      this.sendMessage();  // Call sendMessage function
    }
  }

  // Clear attached files or images from the chat service
  clearAttached() {
    this.chatService.clearAttached();
  }

  // Handle image attachment
  onImageAttached(event: any) {
    this.chatService.setImageAttached(event.target.files[0]);
  }

  // Send the message: stop speech recognition if recording, disable sending button temporarily
  async sendMessage() {
    // If already recording, stop speech recognition
    if (this.isRecording) {
      this.isRecording = false;
      this.speechService.stopRecognition();
    }

    // Disable send and speech button temporarily (sending status)
    this.isSending = true;
    setTimeout(() => { this.isSending = false; }, 1000);  // Reset sending status after 1 second

    let queryText = (<HTMLTextAreaElement>document.getElementById('textarea')).value;  // Get the input text
    if (!queryText) {  // If no text is entered, show an alert
      alert('Vui lòng nhập vào thông tin bạn muốn hỏi');
      return;
    }

    this.chatService.setFirstMsg(queryText);  // Set the first message for the conversation
    let newConvId = await this.chatService.getNewConvId();  // Get the new conversation ID
    this.router.navigate([`/chat/${newConvId}`]);  // Navigate to the new conversation page
  };

  // Stop the speech recognition
  stopRecord() {
    this.isRecording = false;  // Update recording flag
    this.speechService.stopRecognition();  // Stop speech recognition
  }

  // Start speech recognition
  startRecord(): void {
    this.isRecording = true;  // Update recording flag
    this.speechService.startRecognition();  // Start speech recognition
  }

  // Navigate to a specific conversation by its ID
  navigateHistory(convId: String) {
    this.router.navigate([`/chat/${convId}`]);  // Navigate to the selected conversation
  }

  // Format the date using DatePipe
  dateFormat(time: string) {
    return new DatePipe('en-US').transform(time, 'dd/MM/yyyy HH:mm:ss');
  }
}
