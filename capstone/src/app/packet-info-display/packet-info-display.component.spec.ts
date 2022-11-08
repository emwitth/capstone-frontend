import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketInfoDisplayComponent } from './packet-info-display.component';

describe('PacketInfoDisplayComponent', () => {
  let component: PacketInfoDisplayComponent;
  let fixture: ComponentFixture<PacketInfoDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PacketInfoDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacketInfoDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
