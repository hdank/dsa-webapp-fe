import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueVisualizerComponent } from './queue-visualizer.component';

describe('QueueVisualizerComponent', () => {
  let component: QueueVisualizerComponent;
  let fixture: ComponentFixture<QueueVisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueVisualizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueueVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
