import { format } from './ErrorMessageFormatter';

jest.mock('@waldur/core/services', () => ({
  ENV: {apiEndpoint: 'https://example.com/'},
}));

describe('ErrorMessageFormatter', () => {
  it('renders general network error if status code is -1', () => {
    const message = format({status: -1});
    expect(message).toContain('connection to server has failed');
    expect(message).toContain('https://example.com/');
  });

  it('renders status code and status text', () => {
    const message = format({status: 400, statusText: 'BAD REQUEST'});
    expect(message).toBe('400: BAD REQUEST.');
  });

  it('renders error message for array', () => {
    const message = format({
      status: 400,
      statusText: 'BAD REQUEST',
      data: [{
        username: 'Invalid username',
        password: 'Invalid password',
      }],
    });
    expect(message).toBe('400: BAD REQUEST. username: Invalid username, password: Invalid password');
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
    expect(message).toBe('400: BAD REQUEST. username: Invalid username, password: Invalid password');
  });

});
