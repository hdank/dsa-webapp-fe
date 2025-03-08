import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-array-visualizer',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './array-visualizer.component.html',
  styleUrls: ['./array-visualizer.component.scss','../global-visualizer.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ArrayVisualizerComponent implements OnInit {
  items_value: Array<number | null> = [];
  array_size: number = 5;  // Số ô trong mảng
  items_number: number = 5;  // Số ô có giá trị
  frames: Array<number> = [];  // Mảng đại diện cho các frame
  appendValue: number | null = Math.floor(Math.random() * 100);
  removeValue: number | null = Math.floor(Math.random() * 100);
  removeIndex: number | null = Math.floor(Math.random() * 5);
  definedArray: string | null = '1,2,3,4,5';
  insertValue: number | null = Math.floor(Math.random() * 100);
  insertIndex: number | null = Math.floor(Math.random() * 5);
  delaySm = 500;
  minValue = 0;
  maxValue = 0;
  searchValue : number | null = null;
  updateValue : number | null = null;
  updateIndex : number | null = null;
  menuToggle = false;
  subMenuToggle : string = '';
  algoToggle : string = '';
  constructor() { }

  ngOnInit(): void {
    this.items_value = new Array(5).fill(null);  // Khởi tạo mảng với array_size phần tử là null
    this.reloadFrame();
    this.generateArray([], this.items_number, this.array_size);
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

  reloadFrame() {
    this.frames = Array.from({ length: this.array_size }, (_, index) => index)
  }

  UserDefinedArray(items_v: string | null){
    if (!items_v){
      alert('Hãy nhập danh sách mảng là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    let defined_array = items_v.split(',');
    if (!defined_array.every(item => Number.isInteger(parseInt(item)) && !isNaN(Number(item)))) {
      alert('Danh sách mảng người dùng nhập phải là số nguyên và cách nhau bằng dấu phẩy');
      return;
    }
    this.items_number = defined_array.length;
    this.array_size = defined_array.length;
    this.reloadFrame();
    this.generateArray(defined_array.map(item=>Number(item)),this.items_number, this.array_size)
  }

  generateArray(items_v: any[], items_n: number, size: number) {
    if (items_n>size){
      alert('Số lượng phần tử không thể lớn hơn kích cỡ của mảng')
      return;
    }
    this.refresh_highLight();
    this.array_size = size;
    this.reloadFrame();
    if (items_v.length === 0) {
      this.items_value = [];
      for (let i = 0; i < items_n; i++) {
        this.items_value[i] = Math.floor(Math.random() * 100);  // Gán giá trị cho các phần tử đầu tiên
      }
    } else {
      this.items_value = [];
      for (let i = 0; i < items_n; i++) {
        this.items_value[i] = Number(items_v[i]);
      }
    }
  }

  // Hàm thêm phần tử vào mảng
  appendItem(item: number | null) {
    this.refresh_highLight();
    if (item != null) {
      const emptyIndex = this.items_value.indexOf(null);
      console.log("emptyIndex", emptyIndex)
      if (emptyIndex !== -1) {
        this.items_value[emptyIndex] = item;
        this.items_value = [...this.items_value];  // Tạo mảng mới để Angular phát hiện thay đổi
        this.frame_bg_highLight(emptyIndex);
      } else {
        this.array_size += 1;
        this.reloadFrame()
        this.items_value.push(item);
        this.items_value = [...this.items_value];
        console.log(this.items_value.length - 1)
        setTimeout(()=>{
          this.frame_bg_highLight(this.items_value.length - 1);
        },500)
      }
    }
  }

  async insertItem(value: number | null, insert_index: number | null) {
    this.algoToggle = 'insert'
    await this.delay(this.delaySm)
    if (!value || !insert_index){
      alert('Hãy nhập giá trị và vị trí muốn chèn')
      return;
    }
    this.refresh_highLight();
    this.setExcutingCode(0)
    if (this.array_size == this.items_value.length) {
      await this.delay(this.delaySm);
      this.setExcutingCode(1)
      this.array_size += 1;
      this.reloadFrame()
      await this.delay(this.delaySm);
    }
    for (let i = this.items_value.length-1; i >= 0; i--) {
      this.setExcutingCode(2);
      await this.delay(this.delaySm);
      this.setExcutingCode(3);
      await this.delay(this.delaySm);
      if (i>=insert_index){
        this.frame_highLight(i);
        this.frame_bg_highLight(i+1);
        this.shift_right(i)
        this.setExcutingCode(4);
        await this.delay(this.delaySm);
      }else{
        this.setExcutingCode(5);
        await this.delay(this.delaySm);
        this.setExcutingCode(6);
        await this.delay(this.delaySm);
        this.frame_bg_highLight(i+1);
        this.items_value = [...this.items_value].map((item,index) => {
          if (index == insert_index){
            return value;
          }else{
            return item;
          }
        })
        this.setExcutingCode(7);
        await this.delay(this.delaySm);
        return;
      }
      await this.delay(this.delaySm);
    }
  }

  async updateItem(value: number | null, index: number | null) {
    this.algoToggle = 'update'
    await this.delay(this.delaySm);
    if (value == null || index == null) {
      alert('Hãy nhập các giá trị cần cập nhật')
      return;
    }
    let newArray = [...this.items_value];
    newArray[index] = value;
    this.items_value = newArray;
    this.refresh_highLight();
    this.setExcutingCode(0);
    this.frame_highLight(index);
    this.frame_bg_highLight(index)
  }

  // Hàm xóa phần tử khỏi mảng
  async removeItem(value: number | null) {
    this.algoToggle = 'remove-by-value'
    await this.delay(this.delaySm)
    this.refresh_highLight();
    if (!value) {
      alert('Nhập giá trị cần xóa')
      return;
    }
    let j = 0;
    this.mark_highlight(j,'j')
    this.setExcutingCode(0)
    await this.delay(this.delaySm)
      for (let i = 0; i < this.items_value.length; i++) {
        this.setExcutingCode(1)
        this.mark_highlight(i,'i')
        await this.delay(this.delaySm)
        let newArray = [...this.items_value]
        this.frame_highLight(i)
        if ( newArray[i] != value) {
          this.setExcutingCode(2)
          await this.delay(this.delaySm)
          this.setExcutingCode(3)
          this.overWrite(j,i)
          this.frame_bg_highLight(i)
          await this.delay(this.delaySm)
          j++;
          this.mark_highlight(j,'j')
        }
      }
    this.setExcutingCode(4)
    this.array_size =j;
    this.reloadFrame();
    this.refresh_highLight();
  }

  async removeItemByIndex(ind: number | null){
    this.algoToggle = 'remove-by-index'
    await this.delay(this.delaySm)
    this.refresh_highLight();
    if (!ind) {
      alert('Nhập vị trí cần xóa')
      return;
    }
    for (let i = ind; i < this.items_value.length; i++) {
      await this.delay(this.delaySm)
      let newArray = [...this.items_value]
      this.setExcutingCode(0)
      this.frame_highLight(i)
      if (i == ind) {
        this.items_value = newArray.map((item, index) => {
          if (index == i) {
            return null;
          } else {
            return item
          }
        })
      }
      if (i != 0 && this.items_value[i-1]==null){
        this.setExcutingCode(1)
        await this.delay(this.delaySm)
        this.shift_left(i)
        this.frame_bg_highLight(i-1)
        await this.delay(this.delaySm)
      }
    }
    this.setExcutingCode(2);
    this.array_size--;
    this.reloadFrame();
    this.refresh_highLight();
  }

  async findMin() {
    this.algoToggle = 'min'
    await this.delay(this.delaySm)
    if (!(this.items_value.length > 0)) {
      alert('Hiện tại mảng chưa có phần tử')
      return;
    }
    let min = this.items_value[0] || 0
    this.frame_bg_highLight(0)
    this.setExcutingCode(0)
    await this.delay(this.delaySm)
    for (let i = 0; i <= this.items_value.length; i++) {
      this.setExcutingCode(1)
      this.frame_highLight(i)
      await this.delay(this.delaySm)
      let currentValue = this.items_value[i];
      if (currentValue != null) {
        this.setExcutingCode(2)
        await this.delay(this.delaySm)
        if (currentValue < min) {
          min = currentValue;
          this.setExcutingCode(3)
          this.frame_bg_highLight(i);
          await this.delay(this.delaySm)
        }
      }
    }
    this.setExcutingCode(4)
    this.frame_highLight(-1)
    this.minValue = min
  }

  async findMax() {
    this.algoToggle = 'max'
    await this.delay(this.delaySm)
    if (!(this.items_value.length > 0)) {
      alert('Hiện tại mảng chưa có phần tử')
      return;
    }
    let max = this.items_value[0] || 0
    this.frame_bg_highLight(0)
    this.setExcutingCode(0)
    await this.delay(this.delaySm)
    for (let i = 0; i <= this.items_value.length; i++) {
      this.setExcutingCode(1)
      this.frame_highLight(i)
      await this.delay(this.delaySm)
      let currentValue = this.items_value[i];
      if (currentValue != null) {
        this.setExcutingCode(2)
        await this.delay(this.delaySm)
        if (currentValue > max) {
          max = currentValue;
          this.setExcutingCode(3)
          this.frame_bg_highLight(i);
          await this.delay(this.delaySm)
        }
      }
    }
    this.setExcutingCode(4)
    this.frame_highLight(-1)
    this.maxValue = max
  }

  async searchItem(value: number | null){
    this.algoToggle = 'search'
    await this.delay(this.delaySm)
    let isFound = false;
    if (!(this.items_value.length > 0)) {
      alert('Hiện tại mảng chưa có phần tử')
      return;
    }
    if (value == null){
      alert('Nhập giá trị muốn tìm')
      return;
    }
    this.refresh_highLight();
    for (let i = 0; i < this.items_value.length; i++) {
      this.setExcutingCode(0)
      this.frame_highLight(i)
      await this.delay(this.delaySm)
      this.setExcutingCode(1)
      await this.delay(this.delaySm)
      let currentValue = this.items_value[i];
      if (currentValue != null) {
        if (currentValue == value) {
          this.setExcutingCode(2)
          this.frame_bg_highLight(i);
          isFound = true;
          this.frame_highLight(-1)
          return;
          //Đã tìm thấy
        }
      }
    }
    this.frame_highLight(-1)
    this.setExcutingCode(3)
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  shift_left(i:number){
    let newArray = [...this.items_value]
    newArray[i-1] = newArray[i]
    newArray[i] = null
    this.items_value = newArray
  }

  shift_right(i:number){
    let newArray = [...this.items_value]
    newArray[i+1] = newArray[i]
    newArray[i] = null
    this.items_value = newArray
  }

  overWrite(i:number , j:number){
    let newArray = [...this.items_value]
    newArray[i] = newArray[j]
    this.items_value = newArray
  }

  refresh_highLight(){
    this.frame_highLight(-1)
    this.frame_bg_highLight(-1)
    this.mark_highlight(-1,'i')
    this.mark_highlight(-1,'j')
  }

  frame_highLight(ind:number){
    let framesEls = document.querySelectorAll(".frame")
    if (framesEls){
      framesEls.forEach((frame,index) => {
        if (index === ind) {
          frame.classList.add("frame-highLight");
        } else {
          frame.classList.remove("frame-highLight");
        }
      })
    }
  }

  frame_bg_highLight(ind:number){
    let framesEls = document.querySelectorAll(".frame")
    if (framesEls){
      framesEls.forEach((frame,index) => {
        if (index === ind) {
          frame.classList.add("frame-bg-highLight");
        } else {
          frame.classList.remove("frame-bg-highLight");
        }
      })
    }
  }

  mark_highlight(ind: number, type: 'i' | 'j') {
    const elements = document.querySelectorAll(`.frame-for-count-${type}`);
    if (elements) {
      elements.forEach((el, index) => {
        if (index === ind) {
          el.classList.add("show");
        } else {
          el.classList.remove("show");
        }
      });
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
