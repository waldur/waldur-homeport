import { describe, expect, it } from 'vitest';

import { isThreadLoading } from './isThreadLoading';

describe('isThreadLoading', () => {
  it('is true when current thread is loading and not yet cached', () => {
    const threads = new Map<string, unknown[]>();
    expect(isThreadLoading('A', 'A', threads)).toBe(true);
  });

  it('is false when another thread is loading but current is cached', () => {
    const threads = new Map<string, unknown[]>([['B', [{ id: 'm1' }]]]);
    expect(isThreadLoading('A', 'B', threads)).toBe(false);
  });

  it('is false when no thread is loading', () => {
    const threads = new Map<string, unknown[]>([['A', []]]);
    expect(isThreadLoading(null, 'A', threads)).toBe(false);
  });

  it('is false when loading id matches current but cache already has it', () => {
    const threads = new Map<string, unknown[]>([['A', [{ id: 'm1' }]]]);
    expect(isThreadLoading('A', 'A', threads)).toBe(false);
  });
});
