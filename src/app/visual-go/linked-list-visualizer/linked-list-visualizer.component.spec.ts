import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedListVisualizerComponent } from './linked-list-visualizer.component';

describe('LinkedListVisualizerComponent', () => {
  let component: LinkedListVisualizerComponent;
  let fixture: ComponentFixture<LinkedListVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedListVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkedListVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
