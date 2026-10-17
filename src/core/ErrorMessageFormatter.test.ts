import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { format } from './ErrorMessageFormatter';

ENV.apiEndpoint = 'https://example.com/';

describe('ErrorMessageFormatter', () => {
  it('renders general network error if status code is -1', () => {
    const message = format({ status: -1 });
    expect(message).toContain('connection to server has failed');
    expect(message).toContain('https://example.com/');
  });

  it('renders status code and status text', () => {
    const message = format({ status: 400, statusText: 'BAD REQUEST' });
    expect(message).toBe('400: BAD REQUEST.');
  });

  it('renders error message for array', () => {
    const message = format({
      status: 400,
      statusText: 'BAD REQUEST',
      data: [
        {
          username: 'Invalid username',
          password: 'Invalid password',
        },
      ],
    });
    expect(message).toBe(
      '400: BAD REQUEST. username: Invalid username, password: Invalid password',
    );
  });

  it('renders error message for object', () => {
    const message = format({
      status: 400,
      statusText: 'BAD REQUEST',
      data: {
        username: 'Invalid username',
        password: 'Invalid password',
      },
    });
    expect(message).toBe(
      '400: BAD REQUEST. username: Invalid username, password: Invalid password',
    );
  });

  // The shape the auth-core interceptor produces for {url: [...]}: the lifted
  // request URL has replaced the field, and only `data` still holds it.
  it('renders a field error named like an envelope key', () => {
    const message = format({
      status: 400,
      statusText: 'Bad Request',
      url: 'https://example.com/api/offerings/1/update_endpoint/',
      response: {},
      data: { url: ['Enter a valid URL.'] },
    });
    expect(message).toBe('400: Bad Request. url: Enter a valid URL.');
  });
});
