import { Injectable } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import {environments} from "../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private flaskUrl = `${environments.API_FLASK_BE}`
  private baseUrl = `${environments.API_JAVA_BE}`
  private currentConId: string | null = null; // Holds the current conversation ID
  private firstMsg: string = ''; // First message for a new chat, shared between components
  private count = 0; // Used for tracking message counts for unique class names
  attachedImage!: File | null; // Holds the image attached by the user
  MAX_SIZE = 10 * 1024 * 1024; // Maximum allowed image size (10MB)

  constructor(private route: ActivatedRoute) { }

  //conver to Byte
  convertFileSize(sizeInBytes: number): string {
    const units: string[] = ["Byte", "KB", "MB", "GB", "TB"];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Set the first message for a new chat
  setFirstMsg(data: string) {
    this.firstMsg = data;
  }

  // Get the first message for a new chat
  getFirstMsg() {
    return this.firstMsg;
  }

  // Clear the attached image and remove related UI elements
  clearAttached() {
    this.attachedImage = null;
    const attachedContainer = document.querySelector("#attached-img-container");
    const closebtn = document.querySelector(".clear-attach-btn");
    attachedContainer?.classList.remove("attached");
    if (attachedContainer && closebtn) {
      Array.from(attachedContainer.children).forEach(child => {
        if (child !== closebtn) {
          attachedContainer.removeChild(child);
        }
      });
    }
    console.log("this.attachedImage", this.attachedImage);
  }

  // Set the attached image and handle the preview display
  setImageAttached(attImg: any) {
    let image = document.createElement('img');
    let imageName = document.createElement('p');
    image.className = "attach-preview";
    image.style.height = "80px";
    imageName.className = "attach-preview-name";

    // Check if the image size is within the limit
    if (attImg.size > this.MAX_SIZE) {
      alert("Maximum file size : 10MB");
      return;
    }

    console.log("test");

    // Set the uploaded image to the variable
    this.attachedImage = attImg;
    const attachedContainer = document.querySelector("#attached-img-container");

    if (!this.attachedImage) {
      attachedContainer?.classList.remove('attached');
      return;
    } else {
      attachedContainer?.classList.add('attached');
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result;
        image.src = <string>base64String;
        imageName.innerHTML = <string>this.attachedImage?.name + ` (${this.convertFileSize(<number><unknown>this.attachedImage?.size)})`;
        attachedContainer?.append(image);
        attachedContainer?.append(imageName);
      };
      reader.readAsDataURL(attImg);
    }
  }

  // Speech synthesis for reading messages aloud
  textSpeeching(message: "" | null | string) {
    console.log(message);
    if (message == null) {
      alert("Have some problem with speeching");
      return;
    }

    const speech = new SpeechSynthesisUtterance(message);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    speech.onend = () => {
      speechSynthesis.cancel();
      console.log("Speech finished, no repeat.");
    };
    speechSynthesis.speak(speech);
  }

  // Function to handle server responses for queries
  async serverResponse(query: string) {
    let div = document.createElement('div');
    let p = document.createElement('p');
    let time = document.createElement('p');
    let readButton = document.createElement('button');
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

    // Handle related files and document links
    let relateFileBox = document.createElement('div');
    let extendBtn = document.createElement('div');
    let relateDocDropdown = document.createElement('div');
    relateFileBox.className = "relate-doc-container";
    extendBtn.className = "relate-doc-extendBtn";
    relateDocDropdown.className = "relate-doc-dropdown";
    extendBtn.innerHTML = '<p>Tai lieu lien quan</p>\n' +
      '                <span class="material-symbols-outlined">\n' +
      '                add_box\n' +
      '                </span>';
    extendBtn.addEventListener('click', () => {
      relateDocDropdown?.classList.toggle("show");
    });

    let span = extendBtn.querySelector('span');
    if (span != null) {
      if (relateDocDropdown.classList.contains("show")) {
        span.textContent = 'remove_box';
      } else {
        span.textContent = 'add_box';
      }
    }

    relateFileBox.appendChild(extendBtn);
    relateFileBox.appendChild(relateDocDropdown);

    // Collect full response
    let fullResponse = '';
    let appendedList: any[] = [];
    const formData = new FormData();
    formData.append("image", this.attachedImage || '');
    formData.append("query", query);
    if (this.currentConId != null) {
      formData.append("conversation_id", this.currentConId);
    }

    // Fetch server response
    fetch(`${this.flaskUrl}/ask_pdf`, {
      method: 'POST',
      body: formData
    }).then((response) => {
      let getRelateDoc = false;
      const reader = response.body?.getReader();

      const read = () => {
        reader?.read().then(({ done, value }) => {
          if (done) {
            div.appendChild(relateFileBox);
            console.log("end");
            return;
          }
          const decoder = new TextDecoder();
          console.log(decoder.decode(value));
          const jsonData = JSON.parse(decoder.decode(value).replace(/^data:\s*/, ''));

          // Append related documents to dropdown
          if (!getRelateDoc) {
            console.log(jsonData.docs);
            const docList = jsonData.docs;
            if (docList.length != 0) {
              for (const doc of docList) {
                let filePathSplit = doc.metadata.file_path.split("\\");
                const fileName = filePathSplit[filePathSplit.length - 1];
                if (!appendedList.includes(fileName)) {
                  let relateDocEl = document.createElement("div");
                  let docName = document.createElement("p");
                  let author = document.createElement("p");
                  let score = document.createElement("p");
                  relateDocEl.className = "relate-doc";
                  docName.className = "doc-name";
                  author.className = "author";
                  score.className = "score";
                  docName.innerText = fileName;
                  author.innerText = doc.metadata.Author;
                  score.innerText = doc.score;
                  relateDocEl.appendChild(docName);
                  relateDocEl.appendChild(author);
                  relateDocEl.appendChild(score);
                  relateDocDropdown.appendChild(relateDocEl);
                  appendedList.push(fileName);
                }
              }
            }
          }
          // Collect and display the response
          fullResponse += jsonData.answer.replace(/\n/g, '').replace(/```/g, '');
          p.innerHTML += jsonData.answer.replace(/\n/g, '<br>').replace(/```/g, '<code>');
          readButton.addEventListener('click', () => this.textSpeeching(fullResponse));
          read();
        });
      };

      read();
    });

    // Clear attached image
    this.clearAttached();
  }

  // Function to handle user input and add it to the chat
  userInput(query: string) {
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
    // Clear input area after submission
    (<HTMLTextAreaElement>document.getElementById('textarea')).value = "";
  }

  // Function to handle user sending an image
  userSendImg() {
    var div = document.createElement('div');
    var img = document.createElement('img');
    var time = document.createElement('p');
    let messageTime = new Date();
    console.log(this.attachedImage);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result;
      img.src = <string>base64String;
    };
    if (this.attachedImage == null) {
      return;
    }
    reader.readAsDataURL(this.attachedImage);
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    img.className = "messageImg";
    div.className = "message-box right";
    div.appendChild(time);
    div.appendChild(img);
    document.getElementById('messages-container')?.appendChild(div);
  }

  // Function to save the current conversation to a database
  saveConversation(currentConId: String | null, title: String, userToken: String) {
    if (!(currentConId && title && userToken)) {
      alert("Save conversation failed");
      return;
    }

    // Prepare data to save conversation
    const payload = {
      id: currentConId,
      title: title,
      userToken: userToken
    };

    // Send the conversation data to the server
    fetch(`${this.baseUrl}/user/set-new-conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then((response) => {
      console.log(response);
    });
  }

  // Function to send a message (either user or bot)
  sendMessage(token: String) {
    let queryText = '';
    setTimeout(() => {
      // Handle initial message (if new conversation)
      if (this.firstMsg) {
        queryText = this.firstMsg;
        this.saveConversation(this.currentConId, this.firstMsg, token);
        this.firstMsg = '';
      } else {
        // Get query from input field
        queryText = (<HTMLTextAreaElement>document.getElementById('textarea')).value;
      }

      // Check if there's any input or not
      if (!queryText) {
        alert('Please enter something');
        return;
      }

      // Handle attached image
      if (this.attachedImage) {
        this.userSendImg();
        document.querySelector("#attached-img-container")?.classList.remove("attached");
      }

      // Handle user input and server response
      if (queryText) {
        this.userInput(queryText);
      }
      this.serverResponse(queryText);
    }, 100);
  }

  // Fetch a new conversation ID from the server
  getNewConvId() {
    return fetch(`${this.flaskUrl}/new_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(data => {
        return data.conversation_id;
      })
      .catch(error => {
        console.error('Error fetching new conversation ID:', error);
        return null;
      });
  }

  // Set the current conversation ID
  setCurrentConvId(convId: string) {
    this.currentConId = convId;
  }

  // Function to set history from previous conversations
  setHistory(item: any) {
    var div = document.createElement('div');
    var p = document.createElement('p');
    var time = document.createElement('p');
    let readButton = document.createElement('button');
    p.innerHTML = item.content;
    time.innerHTML = new Date(Math.floor(item.created_at) * 1000).toLocaleString();
    time.className = "messageTime";
    div.appendChild(time);
    div.appendChild(p);
    div.appendChild(readButton);

    // Determine if the message is from the user or bot
    if (item.role == 'user') {
      div.className = "message-box right";
    } else {
      let appendedList: any[] = [];
      let relateFileBox = document.createElement('div');
      let extendBtn = document.createElement('div');
      let relateDocDropdown = document.createElement('div');
      relateFileBox.className = "relate-doc-container";
      extendBtn.className = "relate-doc-extendBtn";
      relateDocDropdown.className = "relate-doc-dropdown";
      extendBtn.innerHTML = '<p>Tài liệu liên quan</p>\n' +
        '                <span class="material-symbols-outlined">\n' +
        '                add_box\n' +
        '                </span>';

      extendBtn.addEventListener('click', () => {
        relateDocDropdown?.classList.toggle("show");
        let span = extendBtn.querySelector('span');
        if (span != null) {
          if (relateDocDropdown.classList.contains("show")) {
            span.textContent = 'disabled_by_default';
          } else {
            span.textContent = 'add_box';
          }
        }
      });
      relateFileBox.appendChild(extendBtn);
      relateFileBox.appendChild(relateDocDropdown);
      const docList = item.docs;
      for (const doc of docList) {
        let filePathSplit = doc.metadata.file_path.split("\\");
        const fileName = filePathSplit[filePathSplit.length - 1];
        if (!appendedList.includes(fileName)) {
          let relateDocEl = document.createElement("div");
          let docName = document.createElement("p");
          let author = document.createElement("p");
          let score = document.createElement("p");
          relateDocEl.className = "relate-doc";
          docName.className = "doc-name";
          author.className = "author";
          score.className = "score";
          docName.innerText = fileName;
          author.innerText = doc.metadata.Author;
          score.innerText = doc.score.toFixed(2);
          relateDocEl.appendChild(docName);
          relateDocEl.appendChild(author);
          relateDocEl.appendChild(score);
          relateDocDropdown.appendChild(relateDocEl);
          appendedList.push(fileName);
        }
      }
      div.className = "message-box left";
      readButton.innerHTML = "<span class=\"material-symbols-outlined\">volume_up</span>";
      readButton.className = "read-button";
      readButton.addEventListener('click', () => this.textSpeeching(item.content));
      div.appendChild(relateFileBox);
    }

    document.getElementById('messages-container')?.appendChild(div);
  }
}
