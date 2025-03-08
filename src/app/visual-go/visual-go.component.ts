import { Component, AfterViewInit } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { ActivatedRoute, Router } from "@angular/router";
import {ArrayVisualizerComponent} from "./array-visualizer/array-visualizer.component";
import {QueueVisualizerComponent} from "./queue-visualizer/queue-visualizer.component";
import {StackVisualizerComponent} from "./stack-visualizer/stack-visualizer.component";
import {LinkedListVisualizerComponent} from "./linked-list-visualizer/linked-list-visualizer.component";

@Component({
  selector: 'app-visual-go',
  standalone: true,
  imports: [
    NgForOf,
    SidebarComponent,
    NgIf,
    ArrayVisualizerComponent,
    QueueVisualizerComponent,
    StackVisualizerComponent,
    LinkedListVisualizerComponent
  ],
  templateUrl: './visual-go.component.html',
  styleUrls: ['./visual-go.component.scss']
})
export class VisualGoComponent implements AfterViewInit {
  param: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.param = params.get('graph');
      if (!this.param) {
        this.router.navigate(['/visual/array']);
      }
    });

    let createEl = document.getElementsByClassName("iframe-container");
    console.log(createEl)
  }

  ngAfterViewInit() {
    this.handleActive();
  }

  handleActive() {
    if (!this.param) return;

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item) => item.classList.remove('active'));

    const activeButton = document.getElementById(`${this.param}-btn`);
    activeButton?.classList.add('active');
  }

  navPage(param: string) {
    this.router.navigate([`/visual/${param}`]).then(() => {
      this.handleActive();
    });
  }


}
