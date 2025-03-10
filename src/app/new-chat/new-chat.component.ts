import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Router } from "@angular/router";
import { AuthserviceService } from "../authservice.service";
import { SpeechService } from "../../service/speech.service";
import { ChatService } from "../../service/chat.service";
import { DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";
import {environments} from "../../environments/environments";
import {HistoryBarComponent} from "../history-bar/history-bar.component";
import {HistoryService} from "../../service/history.service";

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [
    FormsModule,
    SidebarComponent,
    NgClass,
    NgForOf,
    NgIf,
    HistoryBarComponent
  ],
  templateUrl: './new-chat.component.html',
  styleUrl: '../chat/chat.component.scss'
})
export class NewChatComponent {
  @ViewChildren('container') containers!: QueryList<ElementRef>;
  @ViewChildren('text') texts!: QueryList<ElementRef>;

  ngAfterViewInit() {
    this.resetScroll();
  }
  selectedModel = ''
  isRecording = false;  // Flag to check if recording is in progress
  isSending = false;    // Flag to check if the message is being sent
  public suggestedQues = [
    'Khái niệm cấu trúc dữ liệu là gì?',
    'Khái niệm thuật toán là gì?',
    'Thuật toán DFS là gì?',
    'Bubble sort là gì'
  ]

  // Constructor to inject services
  constructor(
    private router: Router,
    private authService: AuthserviceService,
    private speechService: SpeechService,
    private chatService: ChatService,
    private historyService: HistoryService,
  ) { }

  // On component initialization, check token and fetch conversation history
  ngOnInit(): void {

    const token = this.authService.getToken();  // Get the authentication token

    if (token != null) {  // If token exists, continue
      console.log("Chat page");
    } else {
      this.router.navigate(['/login']);  // Redirect to login page if no token
    }

    // Check selectedModel for option button render
    this.selectedModel = this.chatService.getSelectedModel()
    if (this.selectedModel == 'ask_text'){
      let radioBtn = document.getElementById("text_model") as HTMLInputElement;
      radioBtn.checked = true;
    }else{
      let radioBtn = document.getElementById("vision_model") as HTMLInputElement;
      radioBtn.checked = true;
    }
  }

  onSetModel(modelValue:string){
    this.chatService.setSelectedModel(modelValue);
    this.selectedModel = this.chatService.getSelectedModel();
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
    await this.router.navigate([`/chat/${newConvId}`]);  // Navigate to the new conversation page
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

  // Format the date using DatePipe
  dateFormat(time: string) {
    return new DatePipe('en-US').transform(time, 'dd/MM/yyyy HH:mm:ss');
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

  async sendSuggestMsg(suggest:string){
    this.chatService.setFirstMsg(suggest);  // Set the first message for the conversation
    let newConvId = await this.chatService.getNewConvId();  // Get the new conversation ID
    await this.router.navigate([`/chat/${newConvId}`]);  // Navigate to the new conversation page
  }

  startScroll(index: number) {
    const container = this.containers.toArray()[index].nativeElement;
    const text = this.texts.toArray()[index].nativeElement;

    const containerWidth = container.clientWidth;
    const textWidth = text.scrollWidth;

    if (textWidth > containerWidth) {
      text.style.overflow = "visible";
      text.style.transition = 'transform 2s linear';
      text.style.transform = `translateX(-${textWidth - containerWidth}px)`;
    }
  }

  stopScroll(index: number) {
    const text = this.texts.toArray()[index].nativeElement;
    text.style.transition = 'transform 0.5s ease-out';
    text.style.transform = 'translateX(0)';
  }

  resetScroll() {
    this.texts.forEach(text => {
      text.nativeElement.style.transform = 'translateX(0)';
    });
  }
}
