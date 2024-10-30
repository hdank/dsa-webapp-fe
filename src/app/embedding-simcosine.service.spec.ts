import { TestBed } from '@angular/core/testing';

import { EmbeddingSimcosineService } from './embedding-simcosine.service';

describe('EmbeddingSimcosineService', () => {
  let service: EmbeddingSimcosineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmbeddingSimcosineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
