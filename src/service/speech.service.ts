import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private recognition: any = null;
  transcript: string = '';

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

  startRecognition(){
    //Create timer for textarea value delay
    let debounceTimeout: any = null;
    if (this.recognition){
      this.recognition.start();
      console.log('Voice recognition started');
    }
    this.onResult((event) => {
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

    this.onError((event) => {
      console.log(event)
      console.error('Error occurred in speech recognition: ', event.error);
    });
  }
}
