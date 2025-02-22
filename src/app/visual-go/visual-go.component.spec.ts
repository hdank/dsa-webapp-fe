import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualGoComponent } from './visual-go.component';

describe('VisualGoComponent', () => {
  let component: VisualGoComponent;
  let fixture: ComponentFixture<VisualGoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualGoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualGoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
