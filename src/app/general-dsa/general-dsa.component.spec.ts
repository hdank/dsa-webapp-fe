import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDSAComponent } from './general-dsa.component';

describe('GeneralDSAComponent', () => {
  let component: GeneralDSAComponent;
  let fixture: ComponentFixture<GeneralDSAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralDSAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralDSAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
