import { describe, expect, it } from 'vitest';

import { describeConfigError } from './configError';

describe('describeConfigError', () => {
  it('wraps an object-shaped SDK error, preserving it on Error.cause', () => {
    const sdkError = { response: undefined, message: 'underlying failure' };

    const result = describeConfigError(sdkError, 'http://localhost:8080/');

    expect(result.message).toBe('Unable to fetch server configuration.');
    expect(result.cause).toBe(sdkError);
  });

  it('uses the network-failure message for TypeError and carries the cause', () => {
    const networkError = new TypeError('Failed to fetch');

    const result = describeConfigError(networkError, 'http://localhost:8080/');

    expect(result.message).toContain(
      'Please check if you can connect to http://localhost:8080/',
    );
    expect(result.cause).toBe(networkError);
  });

  it('uses the invalid-JSON message for SyntaxError', () => {
    const syntaxError = new SyntaxError('Unexpected token');

    const result = describeConfigError(syntaxError, 'http://localhost:8080/');

    expect(result.message).toBe(
      'Unable to fetch server configuration. Server does not return valid JSON.',
    );
    expect(result.cause).toBe(syntaxError);
  });

  it('uses the HTTP-status message for response errors and carries the cause', () => {
    const httpError = { response: { status: 503 }, statusText: 'Bad Gateway' };

    const result = describeConfigError(httpError, 'http://localhost:8080/');

    expect(result.message).toContain('Error message: Bad Gateway');
    expect(result.cause).toBe(httpError);
  });
});
