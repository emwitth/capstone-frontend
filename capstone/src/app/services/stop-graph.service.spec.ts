import { TestBed } from '@angular/core/testing';

import { StopGraphService } from './stop-graph.service';

describe('StopGraphService', () => {
  let service: StopGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StopGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
