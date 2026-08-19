import { describe, expect, it, vi } from 'vitest';

import { router } from '@/router';

import { goToNotFound } from './utils';

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
