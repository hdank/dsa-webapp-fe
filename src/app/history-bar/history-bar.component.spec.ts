import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryBarComponent } from './history-bar.component';

describe('HistoryBarComponent', () => {
  let component: HistoryBarComponent;
  let fixture: ComponentFixture<HistoryBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
