import {Injectable} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {environments} from "../environments/environments";
import {AuthserviceService} from "../app/authservice.service";
import {HistoryService} from "./history.service";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private flaskUrl = `${environments.API_FLASK_BE}`
  private baseUrl = `${environments.API_JAVA_BE}`
  private checkTitle:boolean = false
  private currentConId: string | null = null; // Holds the current conversation ID
  private firstMsg: string = ''; // First message for a new chat, shared between components
  public selectedModel: string = 'ask_text' // Set init and share selected model between components
  attachedImage!: File | null; // Holds the image attached by the user
  MAX_SIZE = 10 * 1024 * 1024; // Maximum allowed image size (10MB)

  constructor(private route: ActivatedRoute,
              private authService: AuthserviceService,
              private historyService: HistoryService,) { }

  //Response bouncing point
  resBouncingPnt(){
    let div = document.createElement("div");
    for (let i = 0; i < 3; i++) {
      let span = document.createElement("span");
      div.appendChild(span);
    }
    div.classList.add("typing-indicator");
    return div
  }

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
  setSelectedModel(data: string) {
    this.selectedModel = data;
  }

  // Get the first message for a new chat
  getSelectedModel() {
    return this.selectedModel;
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

  strem_config(data: string) {
    let configData = data;

    // Replace HTML tags with divs
    configData = configData.replace(/<CONCEPT>([\s\S]*?)<\/CONCEPT>/g, '<div class="concept"><h3>Khái niệm</h3>$1</div>');
    configData = configData.replace(/<EXAMPLE>([\s\S]*?)<\/EXAMPLE>/g, '<div class="example"><h3>Ví dụ</h3>$1</div>');
    configData = configData.replace(/<VISUALIZATION>([\s\S]*?)<\/VISUALIZATION>/g, '<div class="visualization"><h3>Minh họa</h3>$1</div>');
    configData = configData.replace(/<IMPLEMENTATION>([\s\S]*?)<\/IMPLEMENTATION>/g, '<div class="implementation"><h3>Thực hành</h3>$1</div>');
    configData = configData.replace(/<EXPLAINATION>([\s\S]*?)<\/EXPLAINATION>/g, '<div class="explaination"><h3>Giải thích</h3>$1</div>');
    configData = configData.replace(/<EXPLANATION>([\s\S]*?)<\/EXPLANATION>/g, '<div class="explaination"><h3>Giải thích</h3>$1</div>');
    configData = configData.replace(/<COMPLEXITY>([\s\S]*?)<\/COMPLEXITY>/g, '<div class="complexity"><h3>Độ phức tạp</h3>$1</div>');

    configData = configData.replace(/<VIDEOS>([\s\S]*?)<\/VIDEOS>/g, (match: string, p1: string): string => {
      const videoItems: string = p1.trim().split("\n").map((line: string): string => {
        // Match YouTube links
        const match: RegExpMatchArray | null = line.match(/\d+\.\s*\[(.+?)]\((https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/).+?)\)/)

        if (match) {
          const title: string = match[1];
          const url: string = match[2];

          // Extract video ID from YouTube URL
          let videoId: string | null = null;

          // Handle youtube.com/watch?v= format
          if (url.includes('youtube.com/watch?v=')) {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v');
          }
          // Handle youtu.be/ format
          else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
          }

          if (videoId) {
            // Create proper embed URL
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            return `<figure class="video-container">
            <iframe width="560" height="315" src="${embedUrl}"
              frameborder="0" allowfullscreen title="${title}"></iframe>
            <figcaption>${title}</figcaption>
          </figure>`;
          }

          // Fallback to just showing the link if we can't extract video ID
          return `<div class="video-link"><a href="${url}" target="_blank">${title}</a></div>`;
        }
        return "";
      }).join("\n");

      return '<div class="videos"><h3>Video:</h3>\n<div class="video-grid">' + videoItems + '</div></div>';
    });

    // Replace code blocks
    configData = configData.replace(/```(\w*)([\s\S]*?)```/g, function(match: string, language: string, code: string): string {
      return `<pre><code class="${language}">${code}</code></pre>`;
    });

    // Add line breaks for plain text
    configData = configData.replace(/\n/g, '<br>');
    return configData;
  }

  // Get score color class based on score value
  getScoreClass(score:number) {
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
  }

  // Function to handle server responses for queries
  async serverResponse(query: string) {
    // Create main elements
    const div = document.createElement('div');
    const p = document.createElement('p');
    const time = document.createElement('p');
    const readButton = document.createElement('button');
    const bouncingPoint = this.resBouncingPnt();
    const messageTime = new Date();

    // Set content and styles for elements
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    readButton.innerHTML = "<span class=\"material-symbols-outlined\">volume_up</span>";
    readButton.className = "read-button";
    div.className = "message-box assistant-message";
    p.className = "response";
    p.appendChild(bouncingPoint);

    // Append elements to the message box
    div.appendChild(time);
    div.appendChild(p);
    div.appendChild(readButton);
    document.getElementById('messages-container')?.appendChild(div);

    // Prepare form data
    const formData = new FormData();
    formData.append("image", this.attachedImage || '');
    formData.append("query", query);
    if (this.currentConId) {
      formData.append("conversation_id", this.currentConId);
    }

    // Variables for handling response
    let fullResponse = '';

    // Fetch server response
    fetch(`${this.flaskUrl}/${this.selectedModel}`, {
      method: 'POST',
      body: formData
    }).then((response) => {
      const reader = response.body?.getReader();
      let streamingData = "";
      let conId = '';

      const read = () => {
        reader?.read().then(async ({ done, value }) => {
          if (done) {
            this.checkTitle = false;
            setTimeout(()=>{
              this.getExtendElAfterResp(conId)
            },500)
            console.log("end");
            return;
          }

          // Decode streaming data
          const decoder = new TextDecoder();
          streamingData += decoder.decode(value);

          // Check for complete JSON object
          if (streamingData.trim().endsWith("}")) {
            const jsonStrings = streamingData.split("data: ");
            console.log(jsonStrings)
            for (const string of jsonStrings.slice(1)) {
              try {
                const jsonData = JSON.parse(string);
                conId = jsonData.conversation_id
                // Update conversation title if needed
                if (!this.checkTitle && jsonData.conversation_name) {
                  await fetch(`${this.baseUrl}/user/get-conversation?id=${this.currentConId}`)
                    .then(res => res.json())
                    .then(async data => {
                      if (data.title !== jsonData.conversation_name) {
                        await fetch(`${this.baseUrl}/user/rename-conversation?id=${this.currentConId}&name=${jsonData.conversation_name.trim()}`)
                          .then(() => {
                            console.log('Đổi tiêu đề chat thành công');
                            this.historyService.fetchConversation();
                            this.checkTitle = true;
                          });
                      }
                    });
                }
                // Handle different response types
                if (jsonData.type === 'content') {
                  if (fullResponse === '') {
                    p.removeChild(bouncingPoint);
                  }

                  fullResponse = this.strem_config(jsonData.full);
                  p.innerHTML = fullResponse;
                }else if (jsonData.error) {
                  if (fullResponse === '') {
                    p.removeChild(bouncingPoint);
                  }
                  p.innerHTML += `Error: ${jsonData.error}`;
                }

                // Read button for text-to-speech
                readButton.addEventListener('click', () => this.textSpeeching(fullResponse));
              } catch (error) {
                console.error("Lỗi parse JSON:", error, string);
              }
            }
            streamingData = "";
          }
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
    div.className = "message-box user-message";
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
  async saveConversation(currentConId: String | null, title: String, userId: String) {
    if (!(currentConId && title && userId)) {
      alert("Save conversation failed");
      return;
    }

    // Prepare data to save conversation
    const payload = {
      id: currentConId,
      title: title,
      userId: userId
    };

    // Send the conversation data to the server
    await fetch(`${this.baseUrl}/user/set-new-conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then((response) => {
      //console.log(response);
    });
  }

  // Function to send a message (either user or bot)
  sendMessage() {
    let queryText = '';
    setTimeout(() => {
      // Handle initial message (if new conversation)
      if (this.firstMsg) {
        queryText = this.firstMsg;
        this.saveConversation(this.currentConId, 'Hộp thoại mới', this.authService.getMssv()).then(r =>
          this.historyService.fetchConversation()
        ) ;
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
    // Create main elements
    const div = document.createElement('div');
    const p = document.createElement('p');
    const time = document.createElement('p');
    const readButton = document.createElement('button');

    // Set content for elements
    p.innerHTML = this.strem_config(item.content);
    time.innerHTML = new Date(Math.floor(item.created_at) * 1000).toLocaleString();
    time.className = "messageTime";
    readButton.innerHTML = "<span class=\"material-symbols-outlined\">volume_up</span>";
    readButton.className = "read-button";

    // Append time, message, and read button
    div.appendChild(time);
    div.appendChild(p);
    div.appendChild(readButton);

    // Set up read button functionality
    readButton.addEventListener('click', () => this.textSpeeching(item.content));

    // Determine if the message is from the user or bot
    if (item.role === 'user') {
      div.className = "message-box user-message";
    } else {
      div.className = "message-box assistant-message";
      //--------------------------------Doc----------------------------------------
      div.appendChild(this.getRelateDocBox(item.docs));

      //--------------------------------Evaluate----------------------------------------

      div.appendChild(this.getEvaluateBox(item.evaluation));
    }

    console.log(div);
    document.getElementById('messages-container')?.appendChild(div);
  }

  getRelateDocBox(item:any){
    // Create related document elements
    const relateFileBox = document.createElement('div');
    const extendBtn = document.createElement('div');
    const relateDocDropdown = document.createElement('div');

    relateFileBox.className = "relate-doc-container";
    extendBtn.className = "relate-doc-extendBtn";
    relateDocDropdown.className = "docs-section";

    // Set content for expand button
    extendBtn.innerHTML = `
            <p>Tài liệu liên quan</p>
            <span class="material-symbols-outlined">add_box</span>`;

    // Toggle dropdown visibility
    extendBtn.addEventListener('click', () => {
      relateDocDropdown.classList.toggle("show");
      const span = extendBtn.querySelector('span');
      if (span) {
        span.textContent = relateDocDropdown.classList.contains("show")
          ? 'disabled_by_default'
          : 'add_box';
      }
    });

    // Append related documents elements
    let docList = item;
    if (docList?.length){

      for (let doc of docList) {
        const filePathSplit = doc.metadata.file_path?.split("\\")
          || doc.metadata.source?.split("\\")
          || ["Unknown file"];
        const fileName = filePathSplit[filePathSplit.length - 1];
        const relateDocEl = document.createElement("div");
        relateDocEl.className = "doc-item";
        relateDocEl.innerHTML = `
                                                <div><strong style="cursor: pointer">${doc.metadata.source?.split('\\').pop() || 'Không rõ'}</strong> (độ liên quan: ${(doc.score * 100).toFixed(1)}%)</div>
                                                <pre class="doc-content">${doc.content}</pre>
                                                <div class="doc-metadata">
                                                    <div>Tác giả: ${doc.metadata.Author || 'Không rõ'}</div>
                                                    <div>Nguồn: ${doc.metadata.source.split('\\').pop() || 'Không rõ'}</div>
                                                    <div>Trang: ${doc.metadata.page} / ${doc.metadata.total_pages}</div>
                                                </div>`;
        const strongEl = relateDocEl.querySelector('strong');
        strongEl?.addEventListener("click", (event) => {
          event.stopPropagation();
          this.openRelateDoc(fileName);
        });
        relateDocDropdown.appendChild(relateDocEl);
      }
    }
    relateFileBox.appendChild(extendBtn);
    relateFileBox.appendChild(relateDocDropdown);
    return relateFileBox
  }

  getEvaluateBox(item:any){
    // Handle evaluate links
    const evaluateBox = document.createElement('div');
    const evaluateExtendBtn = document.createElement('div');
    const evaluateDropdown = document.createElement('div');
    evaluateBox.className = "evaluate-container";
    evaluateExtendBtn.className = "evaluate-extendBtn";
    evaluateDropdown.className = "evaluation-section";

    evaluateExtendBtn.innerHTML = `
        <p>Đánh giá phản hồi</p>
        <span class="material-symbols-outlined">add_box</span>`;

    evaluateExtendBtn.addEventListener('click', () => {
      evaluateDropdown.classList.toggle("show");
      const span = evaluateExtendBtn.querySelector('span');
      if (span) {
        span.textContent = evaluateDropdown.classList.contains("show")
          ? 'disabled_by_default'
          : 'add_box';
      }
    });

    evaluateBox.appendChild(evaluateExtendBtn);
    evaluateBox.appendChild(evaluateDropdown);
    // Handle evaluation
    let scores = item.scores
    let summary = item.summary_vi
    evaluateDropdown.innerHTML = `
      <div class="section-title">Đánh giá phản hồi</div>
        <div class="score-container">
            <div class="score-item">
                <div>Tổng điểm</div>
                <div class="score-value">${scores.combined.toFixed(1)}</div>
                <div class="score-bar">
                    <div class="score-fill ${this.getScoreClass(scores.combined)}" style="width: ${scores.combined}%"></div>
                </div>
                <div class="score-label">/ 100</div>
            </div>
            <div class="score-item">
                <div>Cấu trúc</div>
                <div class="score-value">${scores.structure.toFixed(1)}</div>
                <div class="score-bar">
                    <div class="score-fill ${this.getScoreClass(scores.structure)}" style="width: ${scores.structure}%"></div>
                </div>
                <div class="score-label">/ 100</div>
            </div>
            <div class="score-item">
                <div>Nội dung</div>
                <div class="score-value">${scores.content.toFixed(1)}</div>
                <div class="score-bar">
                    <div class="score-fill ${this.getScoreClass(scores.content)}" style="width: ${scores.content}%"></div>
                </div>
                <div class="score-label">/ 100</div>
            </div>
            <div class="score-item">
                <div>Liên quan</div>
                <div class="score-value">${scores.relevance.toFixed(1)}</div>
                <div class="score-bar">
                    <div class="score-fill ${this.getScoreClass(scores.relevance)}" style="width: ${scores.relevance}%"></div>
                </div>
                <div class="score-label">/ 100</div>
            </div>
        </div>
        <div class="sumary-section">
            <div class="section-title">Tóm tắt đánh giá</div>
            <div class="summary-item">${summary.structure}</div>
            <div class="summary-item">${summary.content}</div>
            <div class="summary-item">${summary.relevance}</div>
        </div>
      `
    return evaluateBox;
  }

  async getExtendElAfterResp(conId: string) {
    let evaluationList: any[] = [];
    let docList: any[] = [];
    try {
      const response = await fetch(`${this.flaskUrl}/conversation_history/${conId}`);
      const data = await response.json();
      evaluationList = data.data.messages
        .filter((item: any) => item.role === "assistant")
        .map((item: any) => item.evaluation);
      docList = data.data.messages
        .filter((item: any) => item.role === "assistant")
        .map((item: any) => item.docs);
      console.log(data.data.messages
        .filter((item: any) => item.role === "assistant")
        )
    } catch (error) {
      // this.router.navigate(['/chat']);  // Uncomment if you want to redirect on error
      console.error("Failed to fetch evaluation data:", error);
      return;
    }

    const messageBoxes = document.querySelectorAll(".message-box.assistant-message");
    document.querySelectorAll(".evaluate-container").forEach((item) => {item.remove()})
    document.querySelectorAll(".relate-doc-container").forEach((item) => {item.remove()})
    messageBoxes.forEach((item, index) => {
      if (evaluationList[index]) {  // Check if the evaluation exists for the index
        item.appendChild(this.getRelateDocBox(docList[index]))
        item.appendChild(this.getEvaluateBox(evaluationList[index]));
      }
    });
  }

  openRelateDoc (fileName:string){
    if (!fileName?.endsWith(".pdf")){
      alert("Tập tin không phải pdf")
      return;
    }
    fileName = fileName.slice(0, -4)
    fetch(`${this.flaskUrl}/open_pdf`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // Thêm dòng này
      },
      body: JSON.stringify({file_name:fileName})
    })
      .then(res=>{
        return res.json()
      })
      .then(data=>{
        if (data.pdf_url){
          window.open(data.pdf_url);
        }else{
          alert(data.error && "Lỗi gì đó")
        }
      })
  }
}
