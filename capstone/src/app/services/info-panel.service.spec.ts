import { TestBed } from '@angular/core/testing';

import { InfoPanelService } from './info-panel.service';

describe('InfoPanelService', () => {
  let service: InfoPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
