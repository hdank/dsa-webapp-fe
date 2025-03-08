import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-queue-visualizer',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './queue-visualizer.component.html',
  styleUrls: ['./queue-visualizer.component.scss','../global-visualizer.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0 , transform: 'translateY(-20px)'}),
        animate('200ms', style({ opacity: 1 ,transform: 'translateY(0)'}))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 , transform: 'translateY(20px)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({opacity: 0 , transform: 'translateY(-20px)'}),
        animate('200ms', style({ opacity: 1 ,transform: 'translateY(0)'}))
      ])
    ])
  ]
})
export class QueueVisualizerComponent implements OnInit{
  queue_size:number | null = 5;
  enqueue_value :number | null = Math.floor(Math.random() * 100);
  dequeue_count :number | null = Math.floor(Math.random() * 5)
  queue_value: Array<number | null> = [];
  definedQueue = '2,5,7,6,5';
  menuToggle = false;
  subMenuToggle : string = '';
  algoToggle : string = '';
  delaySm = 500;

  ngOnInit(): void {
    this.generateQueue([], this.queue_size);
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setMenu(){
    this.menuToggle = !this.menuToggle;
  }

  setSubMenu(subStrigger:string){
    if (this.subMenuToggle == subStrigger){
      this.subMenuToggle = '';
    }else{
      this.subMenuToggle = subStrigger
    }
  }


  itemHighLight(ind: number | null){
    let itemsEls = document.querySelectorAll(".queue-item")
    if (itemsEls){
      itemsEls.forEach((item,index) => {
        if (index === ind) {
          item.classList.add("high-light");
        } else {
          item.classList.remove("high-light");
        }
      })
    }
  }

  UserDefinedQueue(items_v: string | null){
    if (!items_v){
      alert('Hãy nhập danh sách hàng chờ là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    let defined_queue = items_v.split(',');
    if (!defined_queue.every(item => Number.isInteger(parseInt(item)) && !isNaN(Number(item)))) {
      alert('Danh sách hàng chờ người dùng nhập phải là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    this.queue_size = defined_queue.length;
    this.generateQueue(defined_queue.map(item=>Number(item)),this.queue_size)
  }

  generateQueue(items_v:any[],size: number|null) {
    if (!size){
      alert('Mời nhập kích cở hàng chờ')
      return;
    }
    this.queue_value = [];
    if (items_v.length === 0) {
      for (let i = 0; i < size; i++){
        this.queue_value.push(Math.floor(Math.random() * 100));
      }
    } else {
      for (let i = 0; i < size; i++) {
        this.queue_value.push(Number(items_v[i]))
      }
    }
  }

  async enQueue(value: number | null) {
    this.algoToggle = 'enqueue'
    await this.delay(this.delaySm)
    this.setExcutingCode(0)
    await this.delay(this.delaySm)
    this.setExcutingCode(1)
    await this.delay(this.delaySm)
    if (value) {
      this.queue_value?.push(value);
    } else {
      alert('Mời nhập vào giá trị muốn thêm vào hàng chờ')
    }
    await this.delay(this.delaySm)
    this.setExcutingCode(2)
    this.itemHighLight(this.queue_value.length-1)
  }

  async deQueue(num:number | null) {
    this.algoToggle = 'dequeue'
    if(!num){
      alert('Mời nhập vào số lượng phần tử muốn lấy ra khỏi hàng chờ');
      return;
    }
    for (let i = 0 ; i < num; i++) {
      this.setExcutingCode(0)
      this.itemHighLight(0)
      await this.delay(this.delaySm)
      this.setExcutingCode(1)
      this.queue_value.length == 0 ? alert('Hàng chờ đã hết giá trị') : this.queue_value.shift()
      await this.delay(this.delaySm)
      this.setExcutingCode(2)
      await this.delay(this.delaySm)
      this.setExcutingCode(3)
    }
  }

  setExcutingCode(index:number){
    let codeEls = document.querySelectorAll(".algo-code")
    if (codeEls.length > 0){
      codeEls.forEach((item) => {item.classList.remove('excuting')})
      codeEls[index].classList.add('excuting')
    }
  }

  speedAdjust(speed: number) {
    this.delaySm = speed;
  }
}
