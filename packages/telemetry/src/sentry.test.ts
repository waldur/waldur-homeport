import * as Sentry from '@sentry/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  addApiErrorBreadcrumb,
  beforeBreadcrumb,
  redactSensitive,
  sanitizeUrl,
} from './sentry';

vi.mock('@sentry/react', () => ({
  addBreadcrumb: vi.fn(),
  setUser: vi.fn(),
}));

const jsonResponse = (
  status: number,
  body: unknown,
  url = 'http://x/api/foo/',
): Response => {
  const response = new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
  // Response.url is read-only, so set it explicitly for assertions.
  Object.defineProperty(response, 'url', { value: url });
  return response;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sanitizeUrl', () => {
  it('redacts token-like query params, keeps the rest', () => {
    expect(
      sanitizeUrl('/api/resources/?token=abc123&page=2&x-auth=deadbeef'),
    ).toBe('/api/resources/?token=%5BFiltered%5D&page=2&x-auth=deadbeef');
  });

  it('redacts across common credential param names', () => {
    expect(sanitizeUrl('/api/?access_token=zzz')).toContain('%5BFiltered%5D');
    expect(sanitizeUrl('/api/?password=zzz')).toContain('%5BFiltered%5D');
  });

  it('leaves clean URLs untouched', () => {
    expect(sanitizeUrl('/api/resources/?page=2')).toBe(
      '/api/resources/?page=2',
    );
  });

  it('preserves absolute URL shape', () => {
    expect(sanitizeUrl('https://api.example.com/x/?token=abc')).toBe(
      'https://api.example.com/x/?token=%5BFiltered%5D',
    );
  });
});

describe('redactSensitive', () => {
  it('replaces sensitive keys at any depth', () => {
    const input = {
      username: 'alice',
      password: 'hunter2',
      nested: { api_key: 'k', ok: 1 },
      list: [{ token: 't' }],
    };
    expect(redactSensitive(input)).toEqual({
      username: 'alice',
      password: '[Filtered]',
      nested: { api_key: '[Filtered]', ok: 1 },
      list: [{ token: '[Filtered]' }],
    });
  });

  it('passes primitives through', () => {
    expect(redactSensitive('x')).toBe('x');
    expect(redactSensitive(null)).toBe(null);
  });
});

describe('beforeBreadcrumb', () => {
  it('sanitizes fetch breadcrumb URLs', () => {
    const crumb = beforeBreadcrumb({
      category: 'fetch',
      data: { url: '/api/?token=secret' },
    });
    expect(crumb.data.url).toBe('/api/?token=%5BFiltered%5D');
  });

  it('ignores non-network breadcrumbs', () => {
    const crumb = beforeBreadcrumb({ category: 'ui.click', message: 'x' });
    expect(crumb).toEqual({ category: 'ui.click', message: 'x' });
  });
});

describe('addApiErrorBreadcrumb', () => {
  it('does not add a breadcrumb for success responses', () => {
    addApiErrorBreadcrumb(jsonResponse(200, { ok: true }));
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
  });

  it('adds a warning breadcrumb with scrubbed body for 4xx', async () => {
    addApiErrorBreadcrumb(
      jsonResponse(
        400,
        { detail: 'bad', password: 'leak' },
        'http://x/api/foo/?token=t',
      ),
    );
    // Body is read asynchronously.
    await vi.waitFor(() => expect(Sentry.addBreadcrumb).toHaveBeenCalled());
    const arg = vi.mocked(Sentry.addBreadcrumb).mock.calls[0][0];
    expect(arg.level).toBe('warning');
    expect(arg.category).toBe('api');
    expect(arg.data.status_code).toBe(400);
    expect(arg.data.url).toBe('http://x/api/foo/?token=%5BFiltered%5D');
    expect(arg.data.body).toContain('[Filtered]');
    expect(arg.data.body).not.toContain('leak');
  });

  it('uses error level for 5xx', async () => {
    addApiErrorBreadcrumb(jsonResponse(500, { detail: 'boom' }));
    await vi.waitFor(() => expect(Sentry.addBreadcrumb).toHaveBeenCalled());
    expect(vi.mocked(Sentry.addBreadcrumb).mock.calls[0][0].level).toBe(
      'error',
    );
  });

  it('returns the response untouched (stream not consumed)', async () => {
    const res = jsonResponse(400, { detail: 'x' });
    expect(addApiErrorBreadcrumb(res)).toBe(res);
    // Original body still readable by the caller.
    await expect(res.json()).resolves.toEqual({ detail: 'x' });
  });
});
