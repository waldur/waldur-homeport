import { describe, expect, it, vi } from 'vitest';

import { router } from '@/router';

import { getErrorStatus, goToErrorPage, goToNotFound } from './utils';

describe('goToNotFound', () => {
  it('keeps the address that produced the error', () => {
    vi.clearAllMocks();

    goToNotFound();

    // The error states have no url, so without `location: false` UI-Router
    // rewrites the address bar to '/' while the 404 page is displayed.
    expect(router.stateService.go).toHaveBeenCalledWith(
      'errorPage.notFound',
      undefined,
      { location: false },
    );
  });
});

describe('getErrorStatus', () => {
  it.each([
    ['an SDK error', { status: 500, response: { status: 500 } }, 500],
    ['an axios-style error', { response: { status: 403 } }, 403],
    ['a bare status', { status: 404 }, 404],
    ['a network failure', new TypeError('Failed to fetch'), undefined],
    ['nothing', undefined, undefined],
  ])('reads %s', (_name, error, expected) => {
    expect(getErrorStatus(error)).toBe(expected);
  });
});

describe('goToErrorPage', () => {
  it.each([
    [403, 'errorPage.noPermission', { location: false }],
    [404, 'errorPage.notFound', { location: false }],
    [428, 'profile-manage', undefined],
    [500, 'errorPage.serverError', { location: false }],
    [503, 'errorPage.serviceNotAvailable', { location: false }],
  ])('sends %i to %s', (status, state, options) => {
    vi.clearAllMocks();

    expect(goToErrorPage({ response: { status } })).toBe(true);
    expect(router.stateService.go).toHaveBeenCalledWith(
      state,
      undefined,
      options,
    );
  });

  // The caller decides what an error without a page of its own means: a
  // failed query stays put, a failed transition falls back to the 404 page.
  it.each([
    ['400', { status: 400 }],
    ['401', { status: 401 }],
    ['a network failure', new TypeError('Failed to fetch')],
  ])('leaves %s to the caller', (_name, error) => {
    vi.clearAllMocks();

    expect(goToErrorPage(error)).toBe(false);
    expect(router.stateService.go).not.toHaveBeenCalled();
  });

  it('navigates through the state service it is given', () => {
    vi.clearAllMocks();
    const stateService = { go: vi.fn() } as any;

    goToErrorPage({ status: 500 }, stateService);

    expect(stateService.go).toHaveBeenCalledWith(
      'errorPage.serverError',
      undefined,
      { location: false },
    );
    expect(router.stateService.go).not.toHaveBeenCalled();
  });
});
