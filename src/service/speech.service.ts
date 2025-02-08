import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private recognition: any = null;  // Reference to the SpeechRecognition instance
  transcript: string = '';  // Holds the transcript of the recognized speech

  constructor() {
    // Check for browser support for SpeechRecognition or webkitSpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // If supported, initialize the SpeechRecognition object
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;  // Continuously listen for speech input
      this.recognition.interimResults = true;  // Allow for intermediate results (in case of partial speech recognition)
      this.recognition.lang = 'vi-VN';  // Set language to Vietnamese
    } else {
      // If not supported, log an error message
      console.error('SpeechRecognition is not supported in this browser.');
    }
  }

  // Method to stop the speech recognition process
  stopRecognition(): void {
    if (this.recognition) {
      this.recognition.stop();  // Stop the recognition
      console.log('Voice recognition stopped');  // Log the stop action
    }
  }

  // Method to attach a callback to handle the recognition result
  onResult(callback: (event: any) => void): void {
    if (this.recognition) {
      this.recognition.onresult = callback;  // Set the callback to be executed when results are returned
    }
  }

  // Method to handle speech recognition errors
  onError(callback: (event: any) => void): void {
    if (this.recognition) {
      this.recognition.onerror = callback;  // Set the callback to be executed on error
    }
  }

  // Method to start speech recognition and handle the results
  startRecognition(): void {
    let debounceTimeout: any = null;  // Initialize a variable to handle debounce for textarea input delay

    if (this.recognition) {
      this.recognition.start();  // Start the speech recognition
      console.log('Voice recognition started');  // Log the start action
    }

    // Handle the results of the speech recognition
    this.onResult((event) => {
      this.transcript = event.results[0][0].transcript;  // Extract the transcript from the recognition result
      console.log(this.transcript);  // Log the transcript for debugging

      // If there's an existing debounce timer, clear it
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Set a debounce timer to update the textarea with the recognized speech after a delay
      debounceTimeout = setTimeout(() => {
        const inputField = document.querySelector('#textarea');  // Find the textarea element
        if (inputField) {
          // Set the value of the textarea to the recognized transcript
          (inputField as HTMLTextAreaElement).value = this.transcript;
        }
      }, 100);  // Delay of 100ms to allow the user to finish speaking before updating the field
    });

    // Handle errors during the speech recognition process
    this.onError((event) => {
      console.log(event);  // Log the error event
      console.error('Error occurred in speech recognition: ', event.error);  // Log the error message
    });
  }
}
