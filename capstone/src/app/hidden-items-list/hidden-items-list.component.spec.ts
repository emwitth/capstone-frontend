import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiddenItemsListComponent } from './hidden-items-list.component';

describe('HiddenItemsListComponent', () => {
  let component: HiddenItemsListComponent;
  let fixture: ComponentFixture<HiddenItemsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HiddenItemsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiddenItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
