import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthserviceService } from "../authservice.service";
import { SpeechService } from "../../service/speech.service";
import { ChatService } from "../../service/chat.service";
import {environments} from "../../environments/environments";

@Component({
  selector: 'app-chat',
  standalone: true,  // This component is a standalone component
  imports: [NgFor, FormsModule, SidebarComponent, NavbarComponent, NgClass], // Import necessary modules and components
  templateUrl: './chat.component.html',  // Path to the HTML template
  styleUrl: './chat.component.scss',  // Path to the component's CSS/SCSS
  encapsulation: ViewEncapsulation.None // Apply the component's CSS to the inserted HTML elements
})

export class ChatComponent implements OnInit {
  private chatHistory = [{}];  // Initialize chat history
  private token = '';  // Token for user authentication
  private flaskUrl = `${environments.API_FLASK_BE}`;  // Base API URL
  isRecording = false;  // State to track if speech recognition is active
  isSending = false;  // State to track if a message is being sent
  content: any;  // Placeholder for content, may be used later
  testStatus = false;  // Toggle state for testing purposes

  // Inject necessary services and modules into the constructor
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthserviceService,
    private speechService: SpeechService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Retrieve token from the auth service
    this.token = this.authService.getToken();
    if (this.token != null) {
      console.log("Chat page");
    } else {
      this.router.navigate(['/login']);  // Redirect to login if no token
    }

    // Get conversation ID from URL parameters
    this.route.paramMap.subscribe(params => {
      const convId = params.get('id');
      if (convId) {
        this.chatService.setCurrentConvId(convId);  // Set the current conversation ID
        // Fetch conversation history from the API if conversation ID exists
        fetch(`${this.flaskUrl}/conversation_history/${convId}`)
          .then(response => response.json())  // Parse the response as JSON
          .then(data => {
            this.chatHistory = data.history;  // Set chat history from the response
            this.setHistoryInit();  // Initialize the chat history
          })
          .catch(error => {
            console.log(error);  // Log error if fetch fails
            this.router.navigate(['/chat']);  // Redirect to chat if an error occurs
          });
      } else {
        this.router.navigate(['/chat']);  // Redirect to chat if no conversation ID
      }
    });

    // Check if it's a new conversation and send the first message if required
    let firstMsg = this.chatService.getFirstMsg();
    if (firstMsg) {
      this.chatService.sendMessage(this.token);  // Send the first message
    }
  }

  // Toggle the status of a test button
  testBtn() {
    this.testStatus = !this.testStatus;
  }

  // Handle key press to send message on "Enter" key press
  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode == 13) {
      this.sendMessage();  // Send message on "Enter" key press
    }
  }

  // Initialize chat history if available
  setHistoryInit() {
    if (this.chatHistory.length > 0) {
      for (const item of this.chatHistory) {
        this.chatService.setHistory(item);  // Add each item to chat history in the service
      }
    } else {
      return;  // No history, return early
    }
  }

  // Clear any attached files or images from the chat
  clearAttached() {
    this.chatService.clearAttached();  // Call the service method to clear attachments
  }

  // Handle image file attachment
  onImageAttached(event: any) {
    this.chatService.setImageAttached(event.target.files[0]);  // Attach the selected image to chat
  }

  // Method to send a message (handles both text and speech)
  sendMessage() {
    if (this.isRecording) {
      this.isRecording = false;  // Stop recording if it was ongoing
      this.speechService.stopRecognition();  // Stop speech recognition service
    }

    // Set sending status to disable send button and provide feedback
    this.isSending = true;
    setTimeout(() => {
      this.isSending = false;  // Reset sending state after 1 second delay
    }, 1000);

    this.chatService.sendMessage(this.token);  // Call service to send message
  }

  // Stop recording if active
  stopRecord() {
    this.isRecording = false;
    this.speechService.stopRecognition();  // Stop speech recognition
  }

  // Start recording for speech-to-text functionality
  startRecord(): void {
    this.isRecording = true;
    this.speechService.startRecognition();  // Start speech recognition service
  }

  // Navigate to a new chat page (can be used for resetting the chat)
  navigateNewChat() {
    this.router.navigate(['/chat']);  // Navigate to the chat page
  }

  // This method is triggered when an item is dragged over the target area.
  dragHover(event: DragEvent) {
    event.preventDefault();  // Prevent the default behavior to allow drop

    // Get the input element by its ID 'message-input'
    const inputElement = document.getElementById('message-input');

    // If the input element is found and it doesn't already have the 'draging' class
    if (inputElement && !inputElement.classList.contains('draging')) {
      inputElement.classList.add('draging');  // Add the 'draging' class to indicate an active drag
    }
  }

  // This method is triggered when the dragged item leaves the target area.
  dragLeave(event: DragEvent) {
    event.preventDefault();  // Prevent the default behavior

    // Get the input element by its ID 'message-input'
    const inputElement = document.getElementById('message-input');

    // If the input element is found and it has the 'draging' class
    if (inputElement && inputElement.classList.contains('draging')) {
      inputElement.classList.remove('draging');  // Remove the 'draging' class to indicate the drag has ended
    }
  }

  // This method is triggered when the item is dropped onto the target area.
  onDrop(event: DragEvent) {
    event.preventDefault();  // Prevent the default behavior to allow drop

    // Get the input element by its ID 'message-input'
    const inputElement = document.getElementById('message-input');

    // If the input element is found and it has the 'draging' class
    if (inputElement && inputElement.classList.contains('draging')) {
      inputElement.classList.remove('draging');  // Remove the 'draging' class to finalize the drop
    }

    // Retrieve the file from the drop event (if any files are dropped)
    const file = event.dataTransfer?.files[0];

    // If a file is found, pass it to the chat service to handle the image attachment
    if (file) {
      this.chatService.setImageAttached(file);  // Call the service to attach the dropped file (image)
    }
  }
}
