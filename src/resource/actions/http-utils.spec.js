import HttpUtils from './http-utils';

describe('HttpUtils', () => {
  let $httpBackend, httpUtils;
  beforeEach(inject((_$http_, _$httpBackend_) => {
    $httpBackend = _$httpBackend_;
    httpUtils = new HttpUtils(_$http_);
  }));

  it('fetches and merges all pages in correct order using header links', () => {
    let result;
    httpUtils.getAll('https://example.com/api/customers/').then(data => result = data);

    $httpBackend
      .when('GET', 'https://example.com/api/customers/')
      .respond(200, [
        {name: 'Customer 1'},
        {name: 'Customer 2'},
      ], {
        link: '<https://example.com/api/customers/?page=2>; rel="next"'
      });

    $httpBackend
      .when('GET', 'https://example.com/api/customers/?page=2')
      .respond(200, [
        {name: 'Customer 3'},
        {name: 'Customer 4'},
      ]);

    $httpBackend.flush();

    expect(result).toEqual([
      {name: 'Customer 1'},
      {name: 'Customer 2'},
      {name: 'Customer 3'},
      {name: 'Customer 4'},
    ]);
  });
});
