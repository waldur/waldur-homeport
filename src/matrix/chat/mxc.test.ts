import { describe, expect, it } from 'vitest';

import { parseMxcUrl } from './mxc';

describe('parseMxcUrl', () => {
  it.each([
    ['mxc://hs.example/abc123', 'hs.example', 'abc123'],
    ['mxc://hs.example:8448/a_b-C', 'hs.example:8448', 'a_b-C'],
    ['mxc://localhost/x', 'localhost', 'x'],
    ['mxc://1.2.3.4:8008/x', '1.2.3.4:8008', 'x'],
    ['mxc://[::1]:8448/x', '[::1]:8448', 'x'],
    ['mxc://[2001:db8::1]/x', '[2001:db8::1]', 'x'],
  ])('accepts %s', (url, serverName, mediaId) => {
    expect(parseMxcUrl(url)).toEqual({ serverName, mediaId });
  });

  it.each([
    ['a parent-directory server', 'mxc://../config'],
    ['a current-directory server', 'mxc://./config'],
    ['an empty label', 'mxc://hs..example/x'],
    ['a leading dot', 'mxc://.hs.example/x'],
    ['a parent-directory media id', 'mxc://hs.example/..'],
    ['a nested path', 'mxc://hs.example/a/b'],
    ['an encoded slash', 'mxc://hs.example/a%2Fb'],
    ['a query', 'mxc://hs.example/x?y=1'],
    ['credentials', 'mxc://user@hs.example/x'],
    ['an unbracketed IPv6', 'mxc://::1/x'],
    ['a long port', 'mxc://hs.example:123456/x'],
    ['no media id', 'mxc://hs.example/'],
    ['another scheme', 'https://hs.example/x'],
    ['a non-string', 42],
  ])('rejects %s', (_, url) => {
    expect(parseMxcUrl(url)).toBeNull();
  });
});
