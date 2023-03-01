import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ToastrService, ToastrModule } from 'ngx-toastr';

import { HiddenItemsListComponent } from './hidden-items-list.component';

describe('HiddenItemsListComponent', () => {
  let component: HiddenItemsListComponent;
  let fixture: ComponentFixture<HiddenItemsListComponent>;
  let ngbAModal: NgbActiveModal;
  let httpClientMock: HttpClientTestingModule;
  let httpClient: HttpClient;
  let toastrService: ToastrService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HiddenItemsListComponent ],
      imports: [NgbModalModule, HttpClientTestingModule, ToastrModule],
      providers: [{provide: NgbActiveModal, useValue: ngbAModal},
                  {provide: HttpClient, useValue: httpClient},
                  {provide: ToastrService, useValue: toastrService}]
    })
    .compileComponents();
  });

  beforeEach(() => {
    ngbAModal = TestBed.inject(NgbActiveModal);
    httpClientMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    toastrService = TestBed.inject(ToastrService);
    fixture = TestBed.createComponent(HiddenItemsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });
});
