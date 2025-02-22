import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {environments} from "../../environments/environments";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthserviceService} from "../authservice.service";
import {ChatService} from "../../service/chat.service";
import {HistoryService} from "../../service/history.service";


@Component({
  selector: 'app-history-bar',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './history-bar.component.html',
  styleUrl: './history-bar.component.scss'
})
export class HistoryBarComponent {
  @ViewChildren('container') containers!: QueryList<ElementRef>;
  @ViewChildren('text') texts!: QueryList<ElementRef>;
  constructor(private chatService: ChatService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthserviceService,
              protected historyService : HistoryService
              ) { }
  isShow = false;
  public activatedHistory = ''
  userId = ''
  // variable for active dropdown
  activeDrp: string | null = null;
  private flaskUrl = `${environments.API_FLASK_BE}`
  private baseUrl = `${environments.API_JAVA_BE}`
  protected readonly confirm = confirm;
  private convId: string | null | undefined;
  ngOnInit() {
    window.onclick = (e: MouseEvent) => {
      // Get dropdowns list
      let drpEls: HTMLElement[] = Array.from(document.querySelectorAll('.operate-dropdown'));
      // Get buttons list
      let btnEls: HTMLElement[] = Array.from(document.querySelectorAll('.history-operator'));

      // Get clicked element
      let clickedElement = e.target as HTMLElement;
      // Check dropdowns list is it contain clicked element
      let isDropdownClick = drpEls.some((dropdown) => dropdown.contains(clickedElement));
      // Check buttons list is it contain clicked element
      let isButtonClick = btnEls.some((btn) => btn.contains(clickedElement));

      // If it outside both dropdowns list and buttons list => close all dropdown
      if (!isDropdownClick && !isButtonClick) {
        drpEls.forEach((item) => item.classList.remove('show'));
        this.activeDrp = null;
      }
    };
    // Get conversation ID from URL parameters
    this.route.paramMap.subscribe(params => {
      this.convId = params.get('id')
    })
    this.setInitActivated()
    this.userId = this.authService.getMssv()  // Set init userId for set conversations record
    this.historyService.fetchConversation()
  }

  setInitActivated(){
    this.route.paramMap.subscribe(params => {
      const convId = params.get('id');
      if (convId){
        this.activatedHistory = convId;
      }
    })
  }

  // Navigate to a specific conversation by its ID
  navigateHistory(convId: string) {
    this.router.navigate([`/chat/${convId}`]);  // Navigate to the selected conversation
    this.activatedHistory = convId;
  }

  // Format the date using DatePipe
  dateFormat(time: string) {
    return new DatePipe('en-US').transform(time, 'dd/MM/yyyy HH:mm:ss');  // Format the date string
  }

  handleDrp(convId: string) {
    // Get dropdown element by clicked conversation ID
    let currentDrp = document.getElementById(`${convId}-drp`);
    // Close if have extending dropdown
    if (this.activeDrp && this.activeDrp !== convId) {
      let previousDrp = document.getElementById(`${this.activeDrp}-drp`);
      previousDrp?.classList.remove('show');
    }
    // If current dropdown extending close it first
    if (currentDrp?.classList.contains('show')) {
      currentDrp.classList.remove('show');
      this.activeDrp = null;
    } else {
      // If current dropdown closing then extend it
      currentDrp?.classList.add('show');
      this.activeDrp = convId;
    }
  }

  closeAllDrp(){
    //after click rename slide up dropdown
    let drpEls: HTMLElement[] = Array.from(document.querySelectorAll('.operate-dropdown'));
    for (let item of drpEls) {
      item.classList.remove('show')
    }
  }

  async renameConversation(convId: string,convTitle: string) {
    await fetch(`${this.baseUrl}/user/rename-conversation?id=${convId}&name=${convTitle}`)
      .then(res => res.json())
      .then(data => {
        console.log('Đổi tiêu đề chat thành công')
        this.historyService.fetchConversation();
      })
  }

  handleRename(convId: string,convTitle: string){
    //Get rendering title element
    let aTag = document.getElementById(`${convId}-title`);
    console.log(aTag)
    //If not found do nothing
    if(!aTag){
      return;
    }
    //Create new input tag for editing
    let inputTag = document.createElement("input");
    inputTag.type = "text";
    inputTag.id = `${convId}-title`;
    inputTag.value = convTitle;
    inputTag.className = 'title-editable';
    //replace <a> with <input>
    aTag.parentNode?.replaceChild(inputTag, aTag);
    //add event for input tag rename title when click outside input field
    inputTag.addEventListener("blur", async ()=> {
      this.renameConversation(convId,inputTag.value)
    });
    //add event for input tag rename title when click outside input field
    inputTag.addEventListener("keydown", async (event)=> {
      if (event.key === "Enter") {
        event.preventDefault();
        this.renameConversation(convId,inputTag.value)
      }
    });
    //after click rename slide up dropdown
    this.closeAllDrp()
  }

  handleDelete(convId: string){
    fetch(`${this.flaskUrl}/delete_conversation/${convId}`, {method :'POST',})
      .then(res=>{
        if (res.status == 200){
          console.log('Delete Success from Flask')
          fetch(`${this.baseUrl}/user/delete-conversation?id=${convId}`, {method :'DELETE',})
            .then(res=>{
              if(res.status == 200){
                console.log('Delete Success from DB')
                this.historyService.fetchConversation()
                if (convId && convId == this.convId){
                  this.router.navigate([`/chat`]);
                }
              }
              else{
                console.log('Delete Fail from DB')
              }
            })
        }else{
          console.log('Delete Fail from Flask')
        }
      })
    //after click rename slide up dropdown
    this.closeAllDrp()
  }

  startScroll(index: number) {
    const container = this.containers.toArray()[index].nativeElement;
    const text = this.texts.toArray()[index].nativeElement;

    const containerWidth = container.clientWidth;
    const textWidth = text.scrollWidth;
    console.log()
    if (textWidth > containerWidth) {
      text.style.overflow = "visible";
      if (text.textContent.length <=40){
        text.style.transition = `transform 1s linear`;
      }else{
        text.style.transition = `transform ${text.textContent.length/20}s linear`;
      }
      text.style.transform = `translateX(-${textWidth - containerWidth}px)`;
    }
  }

  stopScroll(index: number) {
    const text = this.texts.toArray()[index].nativeElement;
    text.style.transition = 'transform 1s ease-out';
    text.style.transform = 'translateX(0)';
  }

  resetScroll() {
    this.texts.forEach(text => {
      text.nativeElement.style.transform = 'translateX(0)';
    });
  }
}
