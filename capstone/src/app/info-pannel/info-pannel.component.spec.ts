import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPannelComponent } from './info-pannel.component';

describe('InfoPannelComponent', () => {
  let component: InfoPannelComponent;
  let fixture: ComponentFixture<InfoPannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoPannelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoPannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
