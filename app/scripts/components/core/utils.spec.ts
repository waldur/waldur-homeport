import {
  formatFilesize,
  formatSnakeCase,
  listToDict,
  getUUID,
  pick,
  toKeyValue,
  parseQueryString,
} from './utils';

describe('formatFilesize', () => {
  // https://opennode.atlassian.net/browse/WAL-378
  it('displays value in MB without any digits after comma if value < 1 GB', () => {
    expect(formatFilesize(700)).toBe('700 MB');
  });

  it('displays value in GB without any digits after comma if value < 1 TB', () => {
    expect(formatFilesize(900 * 1024)).toBe('900 GB');
  });

  it('displays value in TB with one digit after comma if value > 1 TB', () => {
    expect(formatFilesize(1.2 * 1024 * 1024)).toBe('1.2 TB');
  });

  it('rounds value down to lower level', () => {
    expect(formatFilesize(1.29 * 1024 * 1024)).toBe('1.2 TB');
  });
});

describe('formatSnakeCase', () => {
  it('converts camelCase to snake-case', () => {
    expect(formatSnakeCase('formatSnakeCase')).toBe('format-snake-case');
  });
});

describe('listToDict', () => {
  it('converts list to dict', () => {
    const fn = listToDict(
      item => item.name,
      item => item.usage,
    );
    const list = [
      {
        name: 'cpu',
        usage: 4,
      },
      {
        name: 'ram',
        usage: 4096,
      },
    ];
    expect(fn(list)).toEqual({
      cpu: 4,
      ram: 4096,
    });
  });
});

describe('getUUID', () => {
  it('extracts UUID from URL', () => {
    expect(getUUID('http://example.com/api/projects/uuid/')).toBe('uuid');
  });
});

describe('pick', () => {
  it('selects fields from object', () => {
    const source = {username: 'admin', password: 'secret', domain: 'default'};
    const fields = ['username', 'password'];
    const expected = {username: 'admin', password: 'secret'};
    const picker = pick(fields);
    expect(picker((source))).toEqual(expected);
  });
});

describe('toKeyValue', () => {
  it('formats empty object to empty string', () => {
    expect(toKeyValue({})).toBe('');
  });

  it('formats object to query parameter string', () => {
    const actual = toKeyValue({release_floating_ips: false, delete_volumes: true});
    const expected = 'release_floating_ips=false&delete_volumes=true';
    expect(actual).toBe(expected);
  });

  it('encodes escape sequences for special characters', () => {
    const actual = toKeyValue({title: 'Valid string?'});
    const expected = 'title=Valid%20string%3F';
    expect(actual).toBe(expected);
  });
});

describe('parseQueryString', () => {
  it('parses query string', () => {
    const expected = {page: '10', page_size: '50'};
    expect(parseQueryString('page=10&page_size=50')).toEqual(expected);
  });
});
