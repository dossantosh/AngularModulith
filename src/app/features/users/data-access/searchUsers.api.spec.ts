import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersApi } from './searchUsers.api';

describe('UsersApi', () => {
  let api: UsersApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const httpClient = TestBed.inject(HttpClient);
    api = new UsersApi(httpClient);

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

    const req = http.expectOne((r) => r.url === '/api/users');
    const p = req.request.params;

    expect(p.get('limit')).toBe('10');
    expect(p.get('direction')).toBe('NEXT');
    expect(p.get('lastId')).toBe('99');
    expect(p.get('id')).toBe('1');
    expect(p.get('username')).toBe('john');
    expect(p.get('email')).toBe('a@b.com');

    req.flush({
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

    const req = http.expectOne((r) => r.url === '/api/users');
    const p = req.request.params;

    expect(p.has('username')).toBe(false);
    expect(p.has('email')).toBe(false);
    expect(p.has('id')).toBe(false);
    expect(p.has('lastId')).toBe(false);

    req.flush({
      content: [],
      hasNext: false,
      hasPrevious: false,
      nextId: null,
      previousId: null,
      empty: true,
    });
  });
});
