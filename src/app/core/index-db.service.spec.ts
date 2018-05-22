import { TestBed, inject } from '@angular/core/testing';

import { IndexDbService } from './index-db.service';

describe('IndexDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndexDbService]
    });
  });

  it('should be created', inject([IndexDbService], (service: IndexDbService) => {
    expect(service).toBeTruthy();
  }));
});
