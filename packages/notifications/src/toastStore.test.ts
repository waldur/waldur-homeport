import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dismiss,
  showError,
  showInfo,
  showPromise,
  showSuccess,
} from './notify';
import { toastStore } from './toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    toastStore.dismiss();
    vi.runAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast and adds it to the snapshot', () => {
    const id = toastStore.show('info', 'Test Title', 'Test Message', {
      duration: 5000,
    });

    const items = toastStore.getSnapshot();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id,
      variant: 'info',
      title: 'Test Title',
      message: 'Test Message',
      duration: 5000,
      open: true,
    });
  });

  it('updates an existing toast in place when reusing id', () => {
    toastStore.show('info', 'Loading...', undefined, {
      id: 'custom-id',
      duration: 5000,
    });

    expect(toastStore.getSnapshot()).toHaveLength(1);
    expect(toastStore.getSnapshot()[0].title).toBe('Loading...');

    toastStore.show('success', 'Done!', undefined, {
      id: 'custom-id',
      duration: 5000,
    });

    const items = toastStore.getSnapshot();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Done!');
    expect(items[0].variant).toBe('success');
  });

  it('caps visible toasts to MAX_VISIBLE (9)', () => {
    for (let i = 1; i <= 12; i++) {
      toastStore.show('info', `Toast ${i}`, undefined, { duration: 5000 });
    }

    const items = toastStore.getSnapshot();
    expect(items).toHaveLength(9);
    expect(items[0].title).toBe('Toast 4');
    expect(items[8].title).toBe('Toast 12');
  });

  it('marks toast closed on dismiss and removes it after delay', () => {
    const id = toastStore.show('info', 'To be dismissed', undefined, {
      duration: 5000,
    });

    expect(toastStore.getSnapshot()[0].open).toBe(true);

    toastStore.dismiss(id);
    expect(toastStore.getSnapshot()[0].open).toBe(false);

    // Fast-forward past REMOVE_DELAY (200ms)
    vi.advanceTimersByTime(250);
    expect(toastStore.getSnapshot()).toHaveLength(0);
  });

  it('notifies subscribers on change', () => {
    const subscriber = vi.fn();
    const unsubscribe = toastStore.subscribe(subscriber);

    toastStore.show('info', 'Subscribed', undefined, { duration: 5000 });
    expect(subscriber).toHaveBeenCalled();

    unsubscribe();
    toastStore.show('info', 'Another', undefined, { duration: 5000 });
    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});

describe('notify service helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dismiss();
    vi.runAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dispatches showSuccess, showError, and showInfo', () => {
    showSuccess('Success Title', 'Success Message');
    showError('Error Title');
    showInfo('Info Title');

    const items = toastStore.getSnapshot();
    expect(items).toHaveLength(3);
    expect(items[0].variant).toBe('success');
    expect(items[1].variant).toBe('error');
    expect(items[2].variant).toBe('info');
  });

  it('handles showPromise on resolve and reject', async () => {
    const promise = Promise.resolve('data');
    const result = await showPromise(promise, {
      loading: 'Loading data...',
      success: (data) => `Loaded ${data}`,
    });

    expect(result).toBe('data');
    const items = toastStore.getSnapshot();
    expect(items).toHaveLength(1);
    expect(items[0].variant).toBe('success');
    expect(items[0].title).toBe('Loaded data');
  });

  it('handles showPromise on error without rethrowing', async () => {
    const promise = Promise.reject(new Error('Network failure'));
    const result = await showPromise(promise, {
      loading: 'Loading...',
      success: 'Done',
      error: (err: any) => err.message,
    });

    expect(result).toBeUndefined();
    const items = toastStore.getSnapshot();
    expect(items).toHaveLength(1);
    expect(items[0].variant).toBe('error');
    expect(items[0].title).toBe('Network failure');
  });
});
