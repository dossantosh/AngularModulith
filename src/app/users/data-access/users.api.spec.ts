import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UsersApi } from './users.api';

describe('UsersApi', () => {
  let api: UsersApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(UsersApi);
    TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('builds params and trims username/email', () => {
    api
      .search({
        limit: 10,
        direction: 'NEXT',
        lastId: 99,
        filters: { id: 1, username: '  john  ', email: '  a@b.com  ' },
      })
      .subscribe();

    const request = http.expectOne((req) => req.url === '/api/users');
    const params = request.request.params;

    expect(params.get('limit')).toBe('10');
    expect(params.get('direction')).toBe('NEXT');
    expect(params.get('lastId')).toBe('99');
    expect(params.get('id')).toBe('1');
    expect(params.get('username')).toBe('john');
    expect(params.get('email')).toBe('a@b.com');

    request.flush({
      content: [],
      hasNext: false,
      hasPrevious: false,
      nextId: null,
      previousId: null,
      empty: true,
    });
  });

  it('does not include empty username/email in params', () => {
    api
      .search({
        limit: 10,
        direction: 'NEXT',
        lastId: null,
        filters: { id: null, username: '   ', email: '' },
      })
      .subscribe();

    const request = http.expectOne((req) => req.url === '/api/users');
    const params = request.request.params;

    expect(params.has('username')).toBe(false);
    expect(params.has('email')).toBe(false);
    expect(params.has('id')).toBe(false);
    expect(params.has('lastId')).toBe(false);

    request.flush({
      content: [],
      hasNext: false,
      hasPrevious: false,
      nextId: null,
      previousId: null,
      empty: true,
    });
  });
});
