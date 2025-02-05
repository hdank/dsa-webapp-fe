import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private count = 0;
  attachedImage!: File | null;
  MAX_SIZE = 10*1024*1024

  private formDataSubject = new BehaviorSubject<any>(null); // BehaviorSubject để lưu trữ formData
  formData$ = this.formDataSubject.asObservable(); // Observable để component khác có thể subscribe
  constructor() { }

  // Cập nhật formData
  setFormData(formData: any) {
    this.formDataSubject.next(formData);
  }

  // Lấy formData
  getFormData() {
    return this.formDataSubject.getValue();
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

  setImageAttached(attImg:any){
    let image = document.createElement('img');
    let imageName = document.createElement('p');
    image.className = "attach-preview"
    imageName.className = "attach-preview-name"
    //Check image size
    if (attImg.size > this.MAX_SIZE){
      alert("Maximum file size : 10MB")
      return;
    }
    console.log("test")
    //Set upload image to variable
    this.attachedImage = attImg;
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
      reader.readAsDataURL(attImg);
    }
  }

  textSpeeching(message: "" | null | string){
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
  }

  serverResponse(query:string){
    //Create empty element
    let div = document.createElement('div');
    let p = document.createElement('p');
    let time = document.createElement('p');
    //Create speeching button
    let readButton = document.createElement('button');
    console.log("query",query)
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
          readButton.addEventListener('click', () => this.textSpeeching(fullResponse));
          read();
        })
      }
      read();
    });
    //clear attached image
    this.clearAttached()
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

  sendMessage(){

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
  }


}
