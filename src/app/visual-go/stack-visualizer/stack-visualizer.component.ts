import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-stack-visualizer',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './stack-visualizer.component.html',
  styleUrls: ['./stack-visualizer.component.scss','../global-visualizer.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0 , transform: 'translateY(-20px)'}),
        animate('200ms', style({ opacity: 1 ,transform: 'translateY(0)'}))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 , transform: 'translateY(-20px)' }))
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
export class StackVisualizerComponent {
  stack_size:number | null = 5;
  push_value :number | null = Math.floor(Math.random() * 100);
  pop_count :number | null = Math.floor(Math.random() * 5)
  stack_value: Array<number | null> = [];
  definedStack = '2,5,7,6,5';
  menuToggle = false;
  subMenuToggle : string = '';
  algoToggle : string = '';
  delaySm = 500;

  ngOnInit(): void {
    this.generateStack([], this.stack_size);
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

  speedAdjust(speed: number) {
    this.delaySm = speed;
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setExcutingCode(index:number){
    let codeEls = document.querySelectorAll(".algo-code")
    if (codeEls.length > 0){
      codeEls.forEach((item) => {item.classList.remove('excuting')})
      codeEls[index].classList.add('excuting')
    }
  }

  itemHighLight(ind: number | null){
    let itemsEls = document.querySelectorAll(".stack-item")
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

  UserDefinedStack(items_v: string | null){
    if (!items_v){
      alert('Hãy nhập danh sách ngăn xếp là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    let defined_stack = items_v.split(',');
    if (!defined_stack.every(item => Number.isInteger(parseInt(item)) && !isNaN(Number(item)))) {
      alert('Danh sách ngăn xếp người dùng nhập phải là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    this.stack_size = defined_stack.length;
    this.generateStack(defined_stack.map(item=>Number(item)),this.stack_size)
  }

  generateStack(items_v:any[],size: number|null) {
    if (!size){
      alert('Mời nhập kích cở hàng chờ')
      return;
    }
    this.stack_value = [];
    if (items_v.length === 0) {
      for (let i = 0; i < size; i++){
        this.stack_value.push(Math.floor(Math.random() * 100));
      }
    } else {
      for (let i = 0; i < size; i++) {
        this.stack_value.push(Number(items_v[i]))
      }
    }
  }

  async pushStack(value: number | null) {
    this.algoToggle = 'push'
    await this.delay(this.delaySm)
    this.setExcutingCode(0)
    await this.delay(this.delaySm)
    this.setExcutingCode(1)
    await this.delay(this.delaySm)
    if (value) {
      this.stack_value?.unshift(value);
    } else {
      alert('Mời nhập vào giá trị muốn thêm vào hàng chờ')
    }
    await this.delay(this.delaySm)
    this.setExcutingCode(2)
    this.itemHighLight(0)
  }

  async popStack(num:number | null) {
    this.algoToggle = 'pop'
    if(!num){
      alert('Mời nhập vào số lượng phần tử muốn lấy ra khỏi hàng chờ');
      return;
    }
    for (let i = 0 ; i < num; i++) {
      this.setExcutingCode(0)
      await this.delay(this.delaySm)
      this.itemHighLight(0)
      await this.delay(this.delaySm)
      this.setExcutingCode(1)
      if(this.stack_value.length == 0){
        alert('Ngăn xếp đã hết giá trị')
        return;
      }else{
        this.stack_value.shift()
      }
      await this.delay(this.delaySm)
      this.setExcutingCode(2)
      await this.delay(this.delaySm)
      this.setExcutingCode(3)
      await this.delay(this.delaySm)
    }
  }
}
