import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private recognition: any = null;
  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'vi-VN';
    } else {
      console.error('SpeechRecognition is not supported in this browser.');
    }
  }

  startRecognition= () => {
    if (this.recognition){
      this.recognition.start();
      console.log('Voice recognition started');
    }
  };

  stopRecognition(): void {
    if (this.recognition) {
      this.recognition.stop();
      console.log('Voice recognition stopped');
    }
  }

  onResult(callback: (event:any) => void): void {
    if (this.recognition) {
      this.recognition.onresult = callback;
    }
  }

  onError(callback: (event:any) => void): void {
    if (this.recognition) {
      this.recognition.onerror = callback;
    }
  }
}
