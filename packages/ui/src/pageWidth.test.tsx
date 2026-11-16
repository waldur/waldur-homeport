import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  PageWidthProvider,
  usePageBreakpointDown,
  usePageBreakpointUp,
} from './pageWidth';

/** Gives `element` a content width the test can change. */
const sized = (element: HTMLElement, initial: number) => {
  let width = initial;
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get: () => width,
  });
  return (next: number) => {
    width = next;
  };
};

let observers: Array<() => void> = [];
const originalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  observers = [];
  globalThis.ResizeObserver = class {
    constructor(private callback: () => void) {}
    observe() {
      observers.push(this.callback);
    }
    disconnect() {
      observers = observers.filter((callback) => callback !== this.callback);
    }
    unobserve() {}
  } as any;
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

const resizeObserved = () => act(() => observers.forEach((notify) => notify()));

const within =
  (element: HTMLElement) =>
  ({ children }: { children: ReactNode }) => (
    <PageWidthProvider element={element}>{children}</PageWidthProvider>
  );

describe('page breakpoints', () => {
  it("follow the page region's width in the layout, not the window's", () => {
    const page = document.createElement('div');
    const resize = sized(page, 700);
    const { result } = renderHook(
      () => ({
        md: usePageBreakpointUp('md'),
        belowLg: usePageBreakpointDown('lg'),
      }),
      { wrapper: within(page) },
    );

    expect(result.current).toEqual({ md: false, belowLg: true });

    resize(1000);
    resizeObserved();
    expect(result.current).toEqual({ md: true, belowLg: false });
  });

  it('re-render only when a breakpoint is crossed', () => {
    const page = document.createElement('div');
    const resize = sized(page, 800);
    let renders = 0;
    renderHook(
      () => {
        renders += 1;
        return usePageBreakpointUp('lg');
      },
      { wrapper: within(page) },
    );
    const settled = renders;

    for (const width of [820, 850, 900, 950, 991]) {
      resize(width);
      resizeObserved();
    }
    expect(renders).toBe(settled);

    resize(992);
    resizeObserved();
    expect(renders).toBe(settled + 1);
  });

  it("follow <body>'s width outside the layout, as the page-* variants do", () => {
    const resize = sized(document.body, 700);
    const { result } = renderHook(() => usePageBreakpointUp('md'));
    expect(result.current).toBe(false);

    resize(1000);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });
});
