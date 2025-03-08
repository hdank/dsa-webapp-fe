import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {animate, keyframes, style, transition, trigger} from "@angular/animations";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-linked-list-visualizer',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    NgClass
  ],
  templateUrl: './linked-list-visualizer.component.html',
  styleUrls: ['./linked-list-visualizer.component.scss','../global-visualizer.scss'],
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
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({maxWidth: 0}),
        animate('500ms', style({ maxWidth: '100%'}))
      ])
    ])
  ]
})
export class LinkedListVisualizerComponent implements OnInit{
  list_size:number | null = 5;
  list_value: Array<number | null> = [];
  append_value : number | null = 5;
  append_index : number | null = 0;
  remove_index : number | null = 0;
  search_value : number | null = 5;
  definedList = '2,5,7,6,5';
  menuToggle = false;
  subMenuToggle : string = '';
  algoToggle : string = '';
  delaySm = 500;
  isNewNode = false;

  ngOnInit(): void {
    this.generateList([], this.list_size);
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

  refreshHighLight(){
    this.itemHighLight(-1)
    this.borderHighLight(-1)
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

  itemHighLight(ind: number | null){
    let itemsEls = document.querySelectorAll(".list-item")
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

  borderHighLight(ind: number | null){
    let itemsEls = document.querySelectorAll(".list-item")
    if (itemsEls){
      itemsEls.forEach((item,index) => {
        if (index === ind) {
          item.classList.add("border-highlight");
        } else {
          item.classList.remove("border-highlight");
        }
      })
    }
  }

  bgHighLight(ind: number | null){
    let itemsEls = document.querySelectorAll(".list-item")
    if (itemsEls){
      itemsEls.forEach((item,index) => {
        if (index === ind) {
          item.classList.add("bg-highlight");
        } else {
          item.classList.remove("bg-highlight");
        }
      })
    }
  }

  removeAnimation(ind: number | null){
    let itemsEls = document.querySelectorAll(".list-item")
    if (ind != null){
      itemsEls[ind].classList.add('remove-animation');
    }
  }

  UserDefinedList(items_v: string | null){
    if (!items_v){
      alert('Hãy nhập danh sách hàng chờ là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    let defined_queue = items_v.split(',');
    if (!defined_queue.every(item => Number.isInteger(parseInt(item)) && !isNaN(Number(item)))) {
      alert('Danh sách hàng chờ người dùng nhập phải là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    this.list_size = defined_queue.length;
    this.generateList(defined_queue.map(item=>Number(item)),this.list_size)
  }

  generateList(items_v:any[],size: number|null) {
    this.refreshHighLight()
    if (!size){
      alert('Mời nhập kích cở danh sách liên kết')
      return;
    }
    this.list_value = [];
    if (items_v.length === 0) {
      for (let i = 0; i < size; i++){
        this.list_value.push(Math.floor(Math.random() * 100));
      }
    } else {
      for (let i = 0; i < size; i++) {
        this.list_value.push(Number(items_v[i]))
      }
    }
  }

  async appendItem(append_value: number | null, append_index: number | null){
    this.refreshHighLight()
    if (append_value == null || isNaN(append_value)){
      alert('Mời nhập vào giá trị muốn thêm vào danh sách')
      return;
    }
    if (append_index == null || isNaN(append_index)){
      alert('Mời nhập vào vị trí muốn thêm vào danh sách')
      return;
    }
    this.isNewNode = false;
    await this.delay(this.delaySm)
    switch (append_index) {
      case this.list_value.length - 1:
        this.algoToggle = 'append-tail'
        await this.delay(this.delaySm)
        this.setExcutingCode(0)
        await this.delay(this.delaySm)
        this.isNewNode = true;
        await this.delay(this.delaySm)
        this.setExcutingCode(1)
        await this.delay(this.delaySm)
        this.isNewNode = false;
        this.list_value.push(append_value);
        await this.delay(this.delaySm)
        this.setExcutingCode(2)
        await this.delay(this.delaySm)
        this.itemHighLight(this.list_value.length - 1)
        break;
      case 0:
        this.algoToggle = 'append-head'
        await this.delay(this.delaySm)
        this.setExcutingCode(0)
        await this.delay(this.delaySm)
        this.isNewNode = true;
        await this.delay(this.delaySm)
        this.setExcutingCode(1)
        await this.delay(this.delaySm)
        this.isNewNode = false;
        this.list_value.unshift(append_value);
        this.setExcutingCode(2)
        await this.delay(this.delaySm)
        this.itemHighLight(0)
        break;
      default:
        this.algoToggle = 'append-index'
        this.setExcutingCode(0)
        for (let i = 0 ; i < append_index ; i++){
          this.borderHighLight(i);
          await this.delay(this.delaySm)
          this.setExcutingCode(1)
          await this.delay(this.delaySm)
          this.setExcutingCode(2)
          if (i == append_index-1){
            this.setExcutingCode(3)
            await this.delay(this.delaySm)
            this.setExcutingCode(4)
            this.isNewNode = true;
            await this.delay(this.delaySm)
            this.setExcutingCode(5)
            await this.delay(this.delaySm)
            this.setExcutingCode(6)
            this.list_value.splice(append_index, 0, append_value);
            this.isNewNode = false;
            await this.delay(this.delaySm)
            this.itemHighLight(append_index)
            this.borderHighLight(append_index);
            return;
          }
        }
    }
  }

  async removeItem(remove_index: number | null){
    this.refreshHighLight()
    if (remove_index == null || isNaN(remove_index)){
      alert('Mời nhập vào vị trí muốn thêm vào danh sách')
      return;
    }
    await this.delay(this.delaySm)
    if (remove_index == this.list_value.length-1){
      this.algoToggle = 'remove-tail'
      this.setExcutingCode(0)
      await this.delay(this.delaySm);
      this.setExcutingCode(1)
      await this.delay(this.delaySm);
      for (let i = 0 ; i < this.list_value.length-1 ; i++){
        this.setExcutingCode(2)
        await this.delay(this.delaySm);
        this.borderHighLight(i);
        this.bgHighLight(i+1);
        this.setExcutingCode(3)
        await this.delay(this.delaySm);
        if (i == remove_index-1){
          this.setExcutingCode(4)
          await this.delay(this.delaySm);
          this.setExcutingCode(5)
          this.removeAnimation(remove_index);
          await this.delay(this.delaySm);
          this.list_value.pop();
          break;
        }
      }
    }
    else{
      if (remove_index == 0){
        this.algoToggle = 'remove-head';
        await this.delay(this.delaySm);
        this.setExcutingCode(0);
        this.borderHighLight(0);
        await this.delay(this.delaySm);
        this.setExcutingCode(1);
        this.bgHighLight(0);
        await this.delay(this.delaySm);
        this.removeAnimation(remove_index);
        this.setExcutingCode(2);
        this.list_value.shift();
      }
      else{
        this.algoToggle = 'remove-index';
        this.setExcutingCode(0)
        await this.delay(this.delaySm);
        for (let i = 0 ; i < remove_index ; i++){
          this.setExcutingCode(1)
          await this.delay(this.delaySm);
          this.borderHighLight(i);
          this.bgHighLight(i+1);
          this.setExcutingCode(2)
          await this.delay(this.delaySm);
          if (i == remove_index-1){
            this.setExcutingCode(3)
            await this.delay(this.delaySm);
            this.setExcutingCode(4)
            await this.delay(this.delaySm);
            this.setExcutingCode(5)
            this.removeAnimation(remove_index)
            await this.delay(this.delaySm);
            this.list_value.splice(remove_index,1);
            this.borderHighLight(-1);
            break;
          }
        }
      }
    }
  }

  async searchItem(value : number|null){
    this.refreshHighLight()
    if (value == null || isNaN(value)){
      alert('Mời nhập vào giá trị muốn tìm kiếm trong danh sách')
      return;
    }
    this.algoToggle = 'search-item'
    await this.delay(this.delaySm)
    this.setExcutingCode(0)
    for (let i = 0 ; i < this.list_value.length ; i++){
      await this.delay(this.delaySm)
      this.setExcutingCode(1)
      await this.delay(this.delaySm)
      this.setExcutingCode(2)
      this.borderHighLight(i)
      if (this.list_value[i] == value){
        await this.delay(this.delaySm)
        this.setExcutingCode(4)
        this.itemHighLight(i)
        return;
      }
    }
    await this.delay(this.delaySm)
    this.setExcutingCode(3)
  }
}
