# DSA Web App Frontend Documentation

## Giới thiệu
DSA Web App Frontend là một ứng dụng Angular cung cấp giao diện người dùng cho hệ thống trợ lý AI về Cấu trúc dữ liệu và Thuật toán. Ứng dụng tập trung vào trải nghiệm người dùng với các tính năng chat thông minh, xử lý file và quản lý hội thoại.

## Kiến trúc hệ thống

### Các thành phần chính:

- **ChatService**: 
    - Quản lý các chức năng liên quan đến chat, bao gồm gửi và nhận tin nhắn.
    - Xử lý phản hồi từ server và quản lý file đính kèm.
    - Chuyển đổi text thành giọng nói để hỗ trợ người dùng.

- **HistoryService**: 
    - Quản lý lịch sử hội thoại, bao gồm lưu trữ và truy xuất các cuộc trò chuyện.
    - Cung cấp các phương thức để lấy danh sách hội thoại , sửa tiêu đề và xóa hội thoại.

- **AuthService**: 
    - Xác thực và quản lý người dùng, bao gồm đăng ký, đăng nhập và lấy thông tin người dùng.
    - Bảo vệ các endpoint API bằng cách sử dụng token xác thực.

- **FileService**: 
    - Xử lý tải lên và tải xuống file, bao gồm kiểm tra kích thước file và tạo preview cho file hình ảnh.
    - Hỗ trợ các chức năng liên quan đến file như tải dữ liệu file PDF và mở file PDF trên trình duyệt.

### Cấu trúc thư mục:
```
dsa-webapp-fe/
├── src/
│   ├── app/
│   │   ├── components/
│   │   └── scss
│   ├── services/
│   └── environments/
├── package.json
└── tsconfig.json
```

# ChatService

## Giới thiệu
`ChatService` là một service trong Angular dùng để quản lý các chức năng liên quan đến chat, bao gồm gửi và nhận tin nhắn, xử lý phản hồi từ server, quản lý file đính kèm, và chuyển đổi text thành giọng nói.

## Các thuộc tính chính
- `selectedModel: string`: Mô hình chat được chọn.
- `attachedImage: File | null`: File hình ảnh đính kèm.
- `MAX_SIZE: number`: Kích thước tối đa cho file đính kèm (10MB).
- `authToken: string`: Token xác thực người dùng.
- `currentConversationId: string | null`: ID của cuộc trò chuyện hiện tại.
- `pendingAttachments: File[]`: Danh sách các file đính kèm đang chờ xử lý.
- `chatContainer: HTMLElement`: Phần tử HTML chứa nội dung chat.
- `speechSynthesis: SpeechSynthesis`: Đối tượng xử lý chuyển đổi văn bản thành giọng nói.
- `defaultConfig: SpeechConfig`: Cấu hình mặc định cho chuyển đổi văn bản thành giọng nói.

## Các phương thức chính

### 1. Xử lý tin nhắn

#### `serverResponse(query: string)`
Phương thức này xử lý phản hồi từ server khi người dùng gửi tin nhắn hoặc hình ảnh.

```typescript
async serverResponse(query: string) {
    const messageTime = new Date();
    const div = document.createElement('div');
    const p = document.createElement('p');
    const time = document.createElement('p');
    
    // Cấu hình thời gian
    time.innerHTML = messageTime.toLocaleString();
    time.className = "messageTime";
    
    // Thêm nút đọc
    const readButton = document.createElement('button');
    readButton.innerHTML = "<span class=\"material-symbols-outlined\">volume_up</span>";
    readButton.className = "read-button";
    
    // Xử lý streaming response
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
            message: query,
            conversationId: this.currentConversationId,
            attachments: this.pendingAttachments
        })
    });

    const reader = response.body?.getReader();
    let accumulatedContent = '';
    
    while (true) {
        const {done, value} = await reader?.read() ?? { done: true, value: undefined };
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;

        p.innerHTML = this.formatMessageContent(accumulatedContent);
    }

    if (this.pendingAttachments?.length) {
        const imageContainer = this.createImageContainer();
        
        for (const attachment of this.pendingAttachments) {
            const imagePreview = await this.createImagePreview(attachment);
            imageContainer.appendChild(imagePreview);
        }
        
        p.appendChild(imageContainer);
    }

    div.appendChild(p);
    div.appendChild(time);
    div.appendChild(readButton);
    this.chatContainer.appendChild(div);
}
```

##### Các bước triển khai
1. **Khởi tạo UI components**: Tạo các phần tử HTML để hiển thị tin nhắn và thời gian.
2. **Xử lý loading state**: Hiển thị chỉ báo đang gõ.
3. **Gửi request và xử lý stream**: Gửi yêu cầu tới server và xử lý phản hồi dạng stream.
4. **Xử lý hình ảnh đính kèm**: Hiển thị preview cho các file hình ảnh đính kèm.
5. **Thêm controls**: Thêm các nút điều khiển như copy và text-to-speech.
6. **Xử lý lỗi**: Hiển thị thông báo lỗi nếu có.
7. **Cleanup**: Xóa các file đính kèm sau khi xử lý xong.

#### Phương thức `userInput(query: string)`
Phương thức này xử lý input của người dùng và hiển thị tin nhắn của họ.

```typescript
async userInput(query: string) {
    // Tạo message box
    const messageBox = document.createElement('div');
    messageBox.className = 'message user-message';
    
    // Thêm nội dung và timestamp
    // ...
    
    // Xóa textarea
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.value = '';
}
```

##### Các bước triển khai
1. **Tạo message box**: Tạo phần tử HTML để chứa tin nhắn của người dùng.
2. **Thêm nội dung và timestamp**: Thêm nội dung tin nhắn và thời gian gửi vào message box.
3. **Xóa textarea**: Xóa nội dung trong textarea sau khi tin nhắn được gửi.
##### Các bước triển khai

1. **Kiểm tra kích thước file**: Sử dụng phương thức `checkFileSize` để kiểm tra kích thước file đính kèm. Nếu file vượt quá kích thước tối đa, hiển thị thông báo lỗi và không cho phép tải lên.
2. **Tạo preview hình ảnh**: Sử dụng phương thức `createImagePreview` để tạo preview cho file hình ảnh. Phương thức này sử dụng `FileReader` để đọc file và trả về URL của hình ảnh.
3. **Hiển thị preview**: Sau khi tạo preview, hiển thị hình ảnh trong giao diện người dùng bằng cách thêm URL của hình ảnh vào phần tử HTML tương ứng.

```typescript
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function checkFileSize(file: File): boolean {
    if (file.size > MAX_SIZE) {
        alert("Maximum file size : 10MB");
        return false;
    }
    return true;
}

function createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}
```

### 3. Text-to-Speech
#### Cấu hình Speech Synthesis
Hệ thống Text-to-Speech được triển khai để đọc tin nhắn cho người dùng, hỗ trợ đa ngôn ngữ và có thể tùy chỉnh.

##### Các thuộc tính cấu hình
```typescript
interface SpeechConfig {
    rate: number;     // Tốc độ đọc (0.1 đến 10)
    pitch: number;    // Cao độ giọng nói (0 đến 2)
    volume: number;   // Âm lượng (0 đến 1)
    voice: SpeechSynthesisVoice | null;  // Giọng đọc
    lang: string;     // Ngôn ngữ (vi-VN, en-US)
}
```

##### Triển khai chi tiết
```typescript
class SpeechService {
    private speechSynthesis: SpeechSynthesis;
    private defaultConfig: SpeechConfig = {
        rate: 1,
        pitch: 1,
        volume: 1,
        voice: null,
        lang: 'vi-VN'
    };

    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.initVoices();
    }

    // Khởi tạo danh sách giọng đọc
    private async initVoices(): Promise<void> {
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            return new Promise(resolve => {
                this.speechSynthesis.onvoiceschanged = () => {
                    this.defaultConfig.voice = this.speechSynthesis.getVoices()
                        .find(voice => voice.lang === this.defaultConfig.lang) || null;
                    resolve();
                };
            });
        }
    }

    // Đọc văn bản với cấu hình tùy chỉnh
    public speak(text: string, config?: Partial<SpeechConfig>): void {
        // Dừng âm thanh đang phát nếu có
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const finalConfig = { ...this.defaultConfig, ...config };

        // Áp dụng cấu hình
        utterance.rate = finalConfig.rate;
        utterance.pitch = finalConfig.pitch;
        utterance.volume = finalConfig.volume;
        utterance.voice = finalConfig.voice;
        utterance.lang = finalConfig.lang;

        // Xử lý sự kiện
        utterance.onstart = () => {
            console.log('Bắt đầu đọc văn bản');
        };

        utterance.onend = () => {
            console.log('Kết thúc đọc văn bản');
            this.speechSynthesis.cancel();
        };

        utterance.onerror = (event) => {
            console.error('Lỗi khi đọc văn bản:', event);
        };

        // Phát âm thanh
        this.speechSynthesis.speak(utterance);
    }

    // Dừng đọc
    public stop(): void {
        this.speechSynthesis.cancel();
    }

    // Tạm dừng đọc
    public pause(): void {
        this.speechSynthesis.pause();
    }

    // Tiếp tục đọc
    public resume(): void {
        this.speechSynthesis.resume();
    }
}
```

##### Cách sử dụng
```typescript
// Khởi tạo service
const speechService = new SpeechService();

// Đọc với cấu hình mặc định
speechService.speak('Xin chào');

// Đọc với cấu hình tùy chỉnh
speechService.speak('Hello world', {
    rate: 1.5,
    pitch: 1.2,
    volume: 0.8,
    lang: 'en-US'
});
```

##### Xử lý lỗi và edge cases
```typescript
class SpeechError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SpeechError';
    }
}

function handleSpeechError(error: any): void {
    switch(error.name) {
        case 'NotAllowedError':
            throw new SpeechError('Trình duyệt không cho phép truy cập Speech Synthesis');
        case 'NotSupportedError':
            throw new SpeechError('Trình duyệt không hỗ trợ Speech Synthesis');
        default:
            throw new SpeechError('Lỗi không xác định: ' + error.message);
    }
}
```

##### Hiệu suất và tối ưu hóa
- **Caching giọng nói**: Lưu trữ danh sách giọng đọc để tránh tải lại
- **Quản lý bộ nhớ**: Tự động dọn dẹp sau khi đọc xong
- **Xử lý văn bản dài**: Chia nhỏ văn bản thành các đoạn để xử lý

##### Tương thích trình duyệt
| Trình duyệt | Phiên bản tối thiểu | Ghi chú |
|-------------|---------------------|----------|
| Chrome      | 33                  | Hỗ trợ đầy đủ |
| Firefox     | 49                  | Một số giọng đọc bị giới hạn |
| Edge        | 14                  | Hỗ trợ đầy đủ |
| Safari      | 7                   | Cần cấp quyền |

##### Ví dụ tích hợp với Angular
```typescript
@Injectable({
    providedIn: 'root'
})
export class TextToSpeechService extends SpeechService {
    constructor() {
        super();
    }

    // Thêm các phương thức đặc thù cho Angular
    public speakMessage(message: ChatMessage): void {
        const config: Partial<SpeechConfig> = {
            lang: message.language === 'vi' ? 'vi-VN' : 'en-US'
        };
        this.speak(message.content, config);
    }
}
```

## HistoryService

### 1. Quản lý cuộc trò chuyện

#### Lấy danh sách hội thoại
```typescript
async fetchConversations() {
    try {
        const response = await this.http.get('/api/conversations');
        return response.data;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
}
```

#### Xóa hội thoại
```typescript
async deleteConversation(id: string) {
    try {
        await this.http.delete(`/api/conversations/${id}`);
        this.refreshList();
    } catch (error) {
        console.error('Error deleting conversation:', error);
    }
}
```

### 2. Lưu trữ dữ liệu

#### Cấu trúc dữ liệu hội thoại
```typescript
interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

interface Message {
    id: string;
    content: string;
    type: 'user' | 'bot';
    timestamp: Date;
    attachments?: Attachment[];
}
```

## Các tính năng đặc biệt

### 1. Stream Processing
```typescript
async function processStream(response: Response) {
    const reader = response.body?.getReader();
    let accumulatedContent = '';

    while (true) {
        const { done, value } = await reader?.read() ?? { done: true, value: undefined };
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;

        // Xử lý từng dòng dữ liệu
        const lines = accumulatedContent.split('\n');
        for (const line of lines) {
            // Xử lý từng dòng
            // ...
        }
    }
}
```

### 2. Format HTML động
Hàm formatMessage nhận đầu vào là chuỗi HTML raw và thay thế các tag đặc biệt (<CONCEPT>, <EXAMPLE>, …) thành các đoạn HTML định dạng để hiển thị đẹp hơn.
```typescript
function formatMessage(content: string): string {
    return content
        .replace(/<CONCEPT>([\s\S]*?)<\/CONCEPT>/g, 
                 '<div class="concept"><h3>Khái niệm</h3>$1</div>')
        .replace(/<EXAMPLE>([\s\S]*?)<\/EXAMPLE>/g,
                 '<div class="example"><h3>Ví dụ</h3>$1</div>');
        // ... các pattern khác
}
```

## Triển khai và phát triển

### 1. Cài đặt môi trường
```bash
# Cài đặt dependencies
npm install

# Khởi chạy development server
ng serve

# Build production
ng build --prod
```

### 2. Testing
```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

## Các API tương ứng

### User Endpoints

#### Đăng ký người dùng
- **URL**: `/api/signup`
- **Method**: POST
- **Body**:
```typescript
{
    username: string;
    email: string;
    password: string;
}
```
- **Response**:
```typescript
{
    message: string;
    user: {
        id: string;
        username: string;
        email: string;
    }
}
```

#### Đăng nhập người dùng
- **URL**: `/api/login`
- **Method**: POST
- **Body**:
```typescript
{
    email: string;
    password: string;
}
```
- **Response**:
```typescript
{
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
    }
}
```

#### Lấy thông tin người dùng
- **URL**: `/api/user`
- **Method**: GET
- **Response**:
```typescript
{
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Chat Endpoints

#### Tải dữ liệu file pdf
- **URL**: `/pdf`
- **Method**: POST
- **Body**:
```typescript
{
   file: File;
}
```

#### Mở file pdf trên trình duyệt
- **URL**: `/open_pdf`
- **Method**: POST
- **Body**:
```typescript
{
    file_name: string;
}
```

#### Chat bằng văn bản
- **URL**: `/ask_text`
- **Method**: POST
- **Body**:
```typescript
{
    conversation_id?: string;
    query: string;
}
```

#### Chat bằng hình ảnh
- **URL**: `/ask_vision`
- **Method**: POST
- **Body**:
```typescript
{
    conversation_id?: string;
    query: string;
    attachments?: File[];
}
```

#### Tạo lịch sử trò chuyện mới
- **URL**: `/api/new_conversation`
- **Method**: POST
- **Response**:
```typescript
{
    conversations_id: Conversation[];
}
```

#### Lấy dữ liệu lịch sử trò chuyện
- **URL**: `/api/conversations`
- **Method**: GET
- **Response**:
```typescript
{
    conversations: Conversation[];
    messages: [
        {
            role: 'user' | 'assistant',
            model: string;
            content: string;
            create_at: number;
            docs: {
                resource: string;
                path: string;
                content: string;
            }
            evaluations: {
                scores: {
                    structure: number;
                    content: number;
                    relevance: number;
                    combined: number;
                };
                sumary: {
                    structure:string;
                    content: string;
                    relevance: string;
                }
            }
            
        }
    ];
}
```