import { RejectType } from '@uirouter/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trackChunk } from '@/navigation/pageLoading';
import { router } from '@/router';

import { whenFirstPageReady } from './firstPageReady';

const deferred = () => {
  let resolve: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve: () => resolve() };
};

const lastHook = (method: 'onSuccess' | 'onError') =>
  vi.mocked(router.transitionService[method]).mock.calls.at(-1)[1] as (
    transition?: any,
  ) => void;

const failWith = (type: RejectType) =>
  lastHook('onError')({ error: () => ({ type }) });

describe('whenFirstPageReady', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('waits for the first transition to succeed', async () => {
    const ready = vi.fn();
    whenFirstPageReady(ready);
    await vi.advanceTimersByTimeAsync(1000);
    expect(ready).not.toHaveBeenCalled();

    lastHook('onSuccess')();
    await vi.advanceTimersByTimeAsync(100);
    expect(ready).toHaveBeenCalledOnce();
  });

  it('waits for the page code chunks to arrive', async () => {
    const ready = vi.fn();
    whenFirstPageReady(ready);
    const chunk = deferred();
    void trackChunk(chunk.promise);

    lastHook('onSuccess')();
    await vi.advanceTimersByTimeAsync(2000);
    expect(ready).not.toHaveBeenCalled();

    chunk.resolve();
    await vi.advanceTimersByTimeAsync(100);
    expect(ready).toHaveBeenCalledOnce();
  });

  it('covers a page chunk that starts right after the layout chunk', async () => {
    const ready = vi.fn();
    whenFirstPageReady(ready);
    lastHook('onSuccess')();

    const layout = deferred();
    void trackChunk(layout.promise);
    layout.resolve();
    await vi.advanceTimersByTimeAsync(20);

    const page = deferred();
    void trackChunk(page.promise);
    await vi.advanceTimersByTimeAsync(500);
    expect(ready).not.toHaveBeenCalled();

    page.resolve();
    await vi.advanceTimersByTimeAsync(100);
    expect(ready).toHaveBeenCalledOnce();
  });

  it('keeps waiting through a redirect', async () => {
    const ready = vi.fn();
    whenFirstPageReady(ready);
    failWith(RejectType.SUPERSEDED);
    await vi.advanceTimersByTimeAsync(1000);
    expect(ready).not.toHaveBeenCalled();
  });

  it('gives way when the first transition fails for good', async () => {
    const ready = vi.fn();
    whenFirstPageReady(ready);
    failWith(RejectType.ERROR);
    await vi.advanceTimersByTimeAsync(100);
    expect(ready).toHaveBeenCalledOnce();
  });

  it('does not hold the page back forever on a stuck chunk', async () => {
    const ready = vi.fn();
    whenFirstPageReady(ready);
    void trackChunk(new Promise(() => undefined));
    lastHook('onSuccess')();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(ready).toHaveBeenCalledOnce();
  });

  it('does not hold the page back forever if routing hangs', async () => {
    const ready = vi.fn();
    whenFirstPageReady(ready);
    // Never calls onSuccess or onError
    await vi.advanceTimersByTimeAsync(14_000);
    expect(ready).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);
    expect(ready).toHaveBeenCalledOnce();
  });

  it('does nothing once cancelled', async () => {
    const ready = vi.fn();
    const cancel = whenFirstPageReady(ready);
    cancel();
    lastHook('onSuccess')();
    await vi.advanceTimersByTimeAsync(1000);
    expect(ready).not.toHaveBeenCalled();
  });
});
