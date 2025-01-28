import { Component, contentChild, model, OnInit, ViewEncapsulation } from '@angular/core';
import {NgClass, NgFor} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthserviceService } from "../authservice.service";
import { SpeechService } from "../speech.service";

interface ApiResponse {
  id: string,
  object: string,
  created_at: string;
  model: string;
  done: boolean;
  choices: Array<{index: number , message: { role: string; content: string } }>; // Updated typing for choices
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, FormsModule, SidebarComponent, NavbarComponent, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  encapsulation: ViewEncapsulation.None //apllying the css of the component to the insert element from user
})

export class ChatComponent implements OnInit {
  private count = 0;
  private chatHistory =[{}];
  private apiUrl = "http://localhost:8080/api/conversation";
  isRecording = false;
  isSending = false;
  MAX_SIZE = 10*1024*1024
  attachedImage!: File | null;
  content: any;
  transcript: string = '';



  constructor(private router: Router, private http: HttpClient , private authService:AuthserviceService , private speechService:SpeechService) {
  }

  helloWord(){
    var div = document.createElement('div');
    var p = document.createElement('p');
    var time = document.createElement('p');
    let messageTime = new Date();
    p.innerHTML = "Chào bạn , mình là ChatBot"
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    div.className = "message-box left";
    div.appendChild(time);
    div.appendChild(p);
    document.getElementById('messages-container')?.appendChild(div);
  }

  ngOnInit(): void {
    //var token = localStorage.getItem('authToken');
    const token = this.authService.getToken();
    if (token != null) {
      console.log("Chat page");
    }
    else {
      this.router.navigate(['/login']);
    }
    this.helloWord();
  }

  clearAttached(){
    this.attachedImage = null;
    const attachedContainer = document.querySelector("#attached-img-container");
    const closebtn = document.querySelector(".clear-attach-btn");
    attachedContainer?.classList.remove("attached");
    if (attachedContainer && closebtn){
      Array.from(attachedContainer.children).forEach(child => {
        // Nếu phần tử con không phải là phần tử cần giữ, xóa nó
        if (child !== closebtn) {
          attachedContainer.removeChild(child);
        }
      });
    }
    console.log("this.attachedImage",this.attachedImage)
  }

  onImageAttached(event: any) {
    let image = document.createElement('img');
    let imageName = document.createElement('p');
    image.className = "attach-preview"
    imageName.className = "attach-preview-name"
    //Check image size
    if (event.target.files[0].size > this.MAX_SIZE){
      alert("Maximum file size : 2MB")
      return;
    }
    console.log("test")
    //Set upload image to variable
    this.attachedImage = event.target.files[0];
    //Show attached image container
    const attachedContainer = document.querySelector("#attached-img-container");
    if(!this.attachedImage){
      attachedContainer?.classList.remove('attached');
      return;
    }else{
      attachedContainer?.classList.add('attached');
      const reader = new FileReader();
      reader.onload = (e)=>{
        const base64String = e.target?.result;
        image.src = <string>base64String;
        imageName.innerHTML = <string>this.attachedImage?.name + ` (${<string><unknown>this.attachedImage?.size})`
        attachedContainer?.append(image)
        attachedContainer?.append(imageName)
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  userInput(query:string){
    var div = document.createElement('div');
    var p = document.createElement('p');
    var time = document.createElement('p');
    let messageTime = new Date();
    p.innerHTML = query;
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    div.className = "message-box right";
    div.appendChild(time);
    div.appendChild(p);
    document.getElementById('messages-container')?.appendChild(div);
    //clear input area value
    (<HTMLTextAreaElement>document.getElementById('textarea')).value = "";
  }

  userSendImg(){
    var div = document.createElement('div');
    var img = document.createElement('img');
    var time = document.createElement('p');
    let messageTime = new Date();
    console.log(this.attachedImage)
    const reader = new FileReader();
    reader.onload = (e)=>{
      const base64String = e.target?.result;
      img.src = <string>base64String;
    }
    if (this.attachedImage == null){
      return;
    }
    reader.readAsDataURL(this.attachedImage);
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    img.className = "messageImg"
    div.className = "message-box right";
    div.appendChild(time);
    div.appendChild(img);
    document.getElementById('messages-container')?.appendChild(div);
  }

  // Define a function to read the content
  readMessage = (message: "" | null | string) => {
    console.log(message)
    if(message == null){
      alert("Have some problem with speeching");
      return;
    }

    const speech = new SpeechSynthesisUtterance(message);
    // Speech config
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    speech.onend = () => {
      speechSynthesis.cancel();
      console.log("Speech finished, no repeat.");
    };
    speechSynthesis.speak(speech);
  };

  serverResponse(query:string){
    //Create empty element
    let div = document.createElement('div');
    let p = document.createElement('p');
    let time = document.createElement('p');
    //Create speeching button
    let readButton = document.createElement('button');
    //config message box
    const formData = new FormData();
    formData.append("image", this.attachedImage || '');
    formData.append("query", query);
    let messageTime = new Date();
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    readButton.innerHTML = "<span class=\"material-symbols-outlined\">volume_up</span>";
    readButton.className = "read-button";
    div.className = "message-box left";
    p.className = "response" + this.count;
    div.appendChild(time);
    div.appendChild(p);
    div.appendChild(readButton);
    document.getElementById('messages-container')?.appendChild(div);

    // To store the complete response
    let fullResponse = '';
    console.log("this.attachedImage",this.attachedImage)
    if (this.attachedImage == null){
      //if don't have attached image call api to ask_pdf
      fetch('http://127.0.0.1:5000/ask_pdf', {
        method: 'POST',
        body: formData
      }).then((response) => {
        console.log(response)
        const reader = response.body?.getReader()
        const read =()=>{
          //Start streaming
          reader?.read().then(({done,value})=>{
            if(done){
              console.log("end")
              return
            }
            const decoder = new TextDecoder()
            console.log(decoder.decode(value))
            //Remove "data :" title in response , decode response value then parse to Objects for streaming
            const jsonData = JSON.parse(decoder.decode(value).replace(/^data:\s*/, ''))
            fullResponse += jsonData.answer.replace(/\n/g, '').replace(/```/g,'');
            p.innerHTML += jsonData.answer.replace(/\n/g, '<br>').replace(/```/g,'<code>');
            readButton.addEventListener('click', () => this.readMessage(fullResponse));
            read();
          })
        }
        read();
      });
    }else {
      //if have attached image call api to ask_image
      fetch('http://127.0.0.1:5000/ask_image', {
        method: 'POST',
        body: formData
      }).then((response) => {
        console.log(response)
        const reader = response.body?.getReader()
        const read =()=>{
          //Start streaming
          reader?.read().then(({done,value})=>{
            if(done){
              console.log("end")
              return
            }
            const decoder = new TextDecoder()
            //Parse to Objects for streaming
            console.log(decoder.decode(value))
            const jsonData = JSON.parse(decoder.decode(value).replace(/^data:\s*/, ''))
            fullResponse += jsonData.answer.replace(/\n/g, '').replace(/```/g,'');
            p.innerHTML += jsonData.response.replace(/\n/g, '<br>').replace(/```/g,'<code>');
            readButton.addEventListener('click', () => this.readMessage(fullResponse));
            read();
          })
        }
        read();
      })
    }
    //clear attached image
    this.clearAttached()
  };

  sendMessage()
  {
    //Set sending status for disable sending and speeching button make delay for stop speeching completely
    this.isSending = true;
    setTimeout(() => {this.isSending = false;}, 1000);
    //isRecording == true => speeching => stop
    if (this.isRecording) {
      this.stopListening()
    }
    setTimeout(()=>{
      let query = (<HTMLTextAreaElement>document.getElementById('textarea')).value;
      if (!query){
        alert('Please enter something');
        return;
      }

      //If have attachedImage create a element for pic
      if (this.attachedImage){
        this.userSendImg()
        document.querySelector("#attached-img-container")?.classList.remove("attached")
      }

      //Create a p tag after each input from user
      if (query){
        this.userInput(query);
      }

      //Create a p tag for server response
      this.serverResponse(query);
    },1000)
  };

  startListening(): void {
    //Create timer for textarea value delay
    let debounceTimeout: any = null;
    this.isRecording = true;
    this.speechService.startRecognition();
    this.speechService.onResult((event) => {
      //Get result of record
      this.transcript = event.results[0][0].transcript;
      console.log(this.transcript)
      //Clear timer if have this timer before
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      //Input speeching result to inputField
      debounceTimeout = setTimeout(() => {
        const inputField = document.querySelector('#textarea');
        if (inputField) {
          (inputField as HTMLTextAreaElement).value = this.transcript;
        }
      }, 100);
    });

    this.speechService.onError((event) => {
      console.log(event)
      console.error('Error occurred in speech recognition: ', event.error);
    });
  }

  stopListening(): void {
    this.isRecording = false;
    this.speechService.stopRecognition();
  }
}
