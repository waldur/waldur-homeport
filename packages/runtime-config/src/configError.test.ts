import { describe, expect, it } from 'vitest';

import { describeConfigError } from './configError';

const ENDPOINT = 'http://localhost:8080/';

describe('describeConfigError', () => {
  // The shapes below are what the SDK client actually throws, normalised by the
  // error interceptor in packages/auth-core. The suite used to assert against a
  // synthetic {response: {status}} object that nothing ever produced, which is
  // why every real backend error collapsed into one unactionable sentence.
  it('reports the status and reason for an HTTP error', () => {
    const httpError = {
      detail: 'Not found',
      status: 404,
      statusText: 'Not Found',
      url: ENDPOINT,
    };

    const result = describeConfigError(httpError, ENDPOINT);

    expect(result.message).toBe(
      'Unable to fetch server configuration from http://localhost:8080/. ' +
        'Server responded 404 Not Found.',
    );
    expect(result.cause).toBe(httpError);
  });

  it('reports the status when the server sends no reason phrase', () => {
    const httpError = { status: 502, statusText: '', url: ENDPOINT };

    const result = describeConfigError(httpError, ENDPOINT);

    expect(result.message).toContain('Server responded 502.');
    expect(result.message).not.toContain('undefined');
  });

  // A non-JSON body (an ingress controller's HTML error page) is thrown as a
  // bare string; the interceptor parks it under `body` rather than spreading it
  // into character-indexed keys.
  it('reports the status for a non-JSON error body', () => {
    const htmlError = {
      body: '<html><body>404 page not found</body></html>',
      status: 404,
      statusText: 'Not Found',
      url: ENDPOINT,
    };

    const result = describeConfigError(htmlError, ENDPOINT);

    expect(result.message).toContain('Server responded 404 Not Found.');
    expect(result.cause).toBe(htmlError);
  });

  it('still reads a status nested under response', () => {
    const legacyShape = {
      response: { status: 503, statusText: 'Unavailable' },
    };

    const result = describeConfigError(legacyShape, ENDPOINT);

    expect(result.message).toContain('Server responded 503 Unavailable.');
  });

  it('uses the network-failure message for TypeError and carries the cause', () => {
    const networkError = new TypeError('Failed to fetch');

    const result = describeConfigError(networkError, ENDPOINT);

    expect(result.message).toContain('The request did not complete.');
    expect(result.message).toContain(ENDPOINT);
    expect(result.cause).toBe(networkError);
  });

  it('uses the invalid-JSON message for SyntaxError', () => {
    const syntaxError = new SyntaxError('Unexpected token');

    const result = describeConfigError(syntaxError, ENDPOINT);

    expect(result.message).toBe(
      'Unable to fetch server configuration from http://localhost:8080/. ' +
        'Server does not return valid JSON.',
    );
    expect(result.cause).toBe(syntaxError);
  });

  it('names the endpoint even when the error carries nothing usable', () => {
    const opaque = {};

    const result = describeConfigError(opaque, ENDPOINT);

    expect(result.message).toBe(
      'Unable to fetch server configuration from http://localhost:8080/.',
    );
    expect(result.cause).toBe(opaque);
  });
});
