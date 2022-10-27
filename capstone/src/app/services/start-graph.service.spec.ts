import { TestBed } from '@angular/core/testing';

import { StartGraphService } from './start-graph.service';

describe('StartGraphService', () => {
  let service: StartGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StartGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
