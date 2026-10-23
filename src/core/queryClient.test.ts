import { afterEach, describe, expect, it, vi } from 'vitest';

import { router } from '@/router';

import { queryClient } from './queryClient';

const apiError = (status: number, body: Record<string, unknown> = {}) => ({
  ...body,
  response: { status },
  status,
});

const failQuery = (error, meta?: Record<string, unknown>) =>
  queryClient
    .fetchQuery({
      queryKey: ['failing', Math.random()],
      queryFn: () => Promise.reject(error),
      retry: false,
      meta,
    })
    .catch(() => undefined);

describe('queryClient global error handler', () => {
  afterEach(() => {
    queryClient.clear();
    vi.mocked(router.stateService.go).mockClear();
  });

  it('sends a missing resource to the 404 page, keeping the address', async () => {
    await failQuery(apiError(404));

    expect(router.stateService.go).toHaveBeenCalledWith(
      'errorPage.notFound',
      undefined,
      { location: false },
    );
  });

  it('sends an incomplete profile to the profile form', async () => {
    await failQuery(apiError(428));

    expect(router.stateService.go).toHaveBeenCalledWith(
      'profile-manage',
      undefined,
      undefined,
    );
  });

  // Tables and most queries render their own error state with a retry: one
  // failing section must not replace the whole page with an error page.
  it.each([
    ['403', apiError(403)],
    ['500', apiError(500)],
    ['503', apiError(503)],
    ['a network failure', new TypeError('Failed to fetch')],
  ])('leaves %s to the component', async (_name, error) => {
    await failQuery(error);

    expect(router.stateService.go).not.toHaveBeenCalled();
  });

  it('leaves an out-of-range table page to the table', async () => {
    await failQuery(apiError(404, { detail: 'Invalid page.' }));

    expect(router.stateService.go).not.toHaveBeenCalled();
  });

  it('leaves a query that renders its own error state alone', async () => {
    await failQuery(apiError(404), { skipGlobalErrorRedirect: true });

    expect(router.stateService.go).not.toHaveBeenCalled();
  });
});
