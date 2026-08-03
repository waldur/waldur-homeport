import * as Sentry from '@sentry/react';
import type { Breadcrumb } from '@sentry/react';
import type { Middleware } from 'redux';
import { User } from 'waldur-js-client';

import { SET_CURRENT_USER } from '@/workspace/constants';

/**
 * Keys (query params or object properties) whose values must never reach
 * Sentry. Matched case-insensitively as a substring, so `token` also covers
 * `access_token`, `refresh_token`, etc.
 */
const SENSITIVE_KEY_RE =
  /(authorization|password|token|secret|api[-_]?key|otp|code)/i;

const FILTERED = '[Filtered]';

/** Upper bound on the serialized error body attached to a breadcrumb. */
const MAX_BODY_LENGTH = 1000;

/**
 * Redacts token-like values from a URL's query string while keeping the path
 * intact, so a breadcrumb still shows *which* endpoint was hit without leaking
 * credentials. Falls back to a plain query-strip if the URL cannot be parsed.
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) {
    return url;
  }
  try {
    // Base is only used to parse relative URLs; it is never emitted.
    const parsed = new URL(url, 'http://x');
    let mutated = false;
    parsed.searchParams.forEach((_value, key) => {
      if (SENSITIVE_KEY_RE.test(key)) {
        parsed.searchParams.set(key, FILTERED);
        mutated = true;
      }
    });
    if (!mutated) {
      return url;
    }
    // Preserve the original relative/absolute shape.
    return url.startsWith('http')
      ? parsed.toString()
      : parsed.pathname + parsed.search;
  } catch {
    // Unparseable: drop the query string entirely rather than risk a leak.
    const [path] = url.split('?');
    return url.includes('?') ? `${path}?${FILTERED}` : url;
  }
};

/**
 * Recursively replaces values of sensitive keys with a placeholder. Bounded in
 * depth to stay cheap and avoid choking on cyclic structures.
 */
export const redactSensitive = (value: unknown, depth = 0): unknown => {
  if (depth > 4 || value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1));
  }
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY_RE.test(key)
      ? FILTERED
      : redactSensitive(val, depth + 1);
  }
  return result;
};

/**
 * Sentry `beforeBreadcrumb` hook. Scrubs credentials from the URLs that the
 * automatic fetch/xhr instrumentation records before they are stored.
 */
export const beforeBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb => {
  if (
    (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') &&
    breadcrumb.data?.url
  ) {
    breadcrumb.data.url = sanitizeUrl(String(breadcrumb.data.url));
  }
  return breadcrumb;
};

/**
 * Adds a breadcrumb describing a failed API response, including the parsed and
 * scrubbed error body. The default fetch instrumentation only records the URL,
 * method and status; the response payload is where MasterMind explains *why*
 * the request failed, which is what makes a later exception diagnosable.
 *
 * The body is read from a clone (so the original stream stays intact for the
 * caller) and asynchronously — the breadcrumb is attached slightly after the
 * response passes through, which is fine since it only matters once a later
 * event is captured.
 */
export const addApiErrorBreadcrumb = (response: Response): Response => {
  const { status } = response;
  if (status < 400) {
    return response;
  }
  const finish = (body?: unknown) => {
    Sentry.addBreadcrumb({
      category: 'api',
      type: 'http',
      level: status >= 500 ? 'error' : 'warning',
      data: {
        url: sanitizeUrl(response.url),
        status_code: status,
        ...(body !== undefined ? { body } : {}),
      },
    });
  };

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('json')) {
    finish();
    return response;
  }

  response
    .clone()
    .json()
    .then((parsed) => {
      let serialized = JSON.stringify(redactSensitive(parsed));
      if (serialized && serialized.length > MAX_BODY_LENGTH) {
        serialized = `${serialized.slice(0, MAX_BODY_LENGTH)}…`;
      }
      finish(serialized);
    })
    .catch(() => finish());

  return response;
};

/**
 * Associates captured events with the current user by uuid only. Username and
 * email are deliberately omitted — a Waldur username can itself be PII (e.g. an
 * email-like OIDC identifier), and the uuid is enough to look the user up.
 * Runs on every `SET_CURRENT_USER` dispatch, which is the single funnel for
 * login, session refresh and logout (dispatched with `undefined`, which clears
 * the Sentry user).
 */
export const sentryUserMiddleware: Middleware = () => (next) => (action) => {
  if (action?.type === SET_CURRENT_USER) {
    const user: User | undefined = action.payload?.user;
    Sentry.setUser(user ? { id: user.uuid } : null);
  }
  return next(action);
};
