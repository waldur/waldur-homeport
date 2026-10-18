import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '@/core/queryClient';
import { trackChunk } from '@/navigation/pageLoading';
import { router } from '@/router';

import { RouteLoadingBar } from './RouteLoadingBar';

const deferred = () => {
  let resolve: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve: () => resolve() };
};

const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const bar = () => screen.queryByRole('progressbar');

// Whether the bar appears at any point in the next `ms`, so a flash counts too.
const showsWithin = async (ms: number) => {
  let shown = false;
  for (let elapsed = 0; elapsed < ms; elapsed += 10) {
    await wait(10);
    shown ||= bar() !== null;
  }
  return shown;
};

// Starts a transition that the router settles after `ms`.
const navigate = async (ms: number) => {
  render(<RouteLoadingBar />);
  const transition = deferred();
  const hook = vi
    .mocked(router.transitionService.onBefore)
    .mock.calls.at(-1)[1];
  act(() => void hook({ promise: transition.promise } as any));
  await wait(ms);
  transition.resolve();
};

// A query the new page starts once it has rendered, resolving when told to.
const fetchData = () => {
  const response = deferred();
  act(
    () =>
      void queryClient.fetchQuery({
        queryKey: ['RouteLoadingBar', Math.random()],
        queryFn: () => response.promise.then(() => null),
      }),
  );
  return response;
};

describe('RouteLoadingBar', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    queryClient.clear();
  });

  it('never shows for a transition faster than 100ms', async () => {
    await navigate(50);
    expect(await showsWithin(1000)).toBe(false);
  });

  it('shows after 100ms and stays for at least 300ms', async () => {
    await navigate(150);
    expect(bar()).not.toBeNull();
    await wait(200);
    expect(bar()).not.toBeNull();
    await wait(100);
    expect(bar()).toBeNull();
  });

  it("stays until the new page's data has loaded", async () => {
    await navigate(150);
    const response = fetchData();
    await wait(1000);
    expect(bar()).not.toBeNull();
    response.resolve();
    await wait(100);
    expect(bar()).toBeNull();
  });

  it("stays until the new page's code has loaded", async () => {
    await navigate(150);
    const chunk = deferred();
    act(() => void trackChunk(chunk.promise));
    await wait(1000);
    expect(bar()).not.toBeNull();
    chunk.resolve();
    await wait(100);
    expect(bar()).toBeNull();
  });

  it('never shows when the page and its data load within 100ms', async () => {
    await navigate(20);
    const response = fetchData();
    await wait(60);
    response.resolve();
    expect(await showsWithin(1000)).toBe(false);
  });

  it("shows at 100ms when the page's data is still loading", async () => {
    await navigate(20);
    await wait(30);
    const response = fetchData();
    await wait(60);
    expect(bar()).not.toBeNull();
    response.resolve();
    await wait(400);
    expect(bar()).toBeNull();
  });
});
