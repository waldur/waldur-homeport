import { render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const echarts = vi.hoisted(() => {
  const makeChart = () => {
    let disposed = false;
    const handlers: Record<string, (params: any) => void> = {};
    return {
      setOption: vi.fn(),
      resize: vi.fn(),
      on: vi.fn((event: string, handler: (params: any) => void) => {
        handlers[event] = handler;
      }),
      off: vi.fn((event: string) => {
        delete handlers[event];
      }),
      // A click on a chart element, as ECharts reports it.
      click: (params: any) => handlers.click?.(params),
      dispose: vi.fn(() => {
        disposed = true;
      }),
      isDisposed: () => disposed,
    };
  };
  return {
    init: vi.fn(() => makeChart()),
    getInstanceByDom: vi.fn(() => undefined),
  };
});
vi.mock('@/echarts', () => ({ default: echarts }));

const theme = vi.hoisted(() => ({ current: 'light' }));
vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: theme.current, toggleTheme: () => {} }),
}));

// test/mocks/echarts.js stubs EChart for every other test.
vi.unmock('@/core/EChart');

import { EChart } from '@/core/EChart';

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    disconnect() {}
  },
);

afterEach(() => {
  vi.clearAllMocks();
  theme.current = 'light';
});

describe('EChart', () => {
  it('points the forwarded ref at the new instance after a theme switch', async () => {
    const ref = createRef<any>();
    const { rerender } = render(<EChart ref={ref} options={{}} />);
    await waitFor(() => expect(ref.current).toBeTruthy());
    const first = ref.current;

    theme.current = 'dark';
    rerender(<EChart ref={ref} options={{}} />);

    // Before, the ref kept the disposed instance, whose getDataURL() returns
    // undefined, so a PNG export after a theme switch saved nothing usable.
    await waitFor(() => expect(ref.current).not.toBe(first));
    // Let a second draw started on mount land on top of this one, however long
    // its import takes.
    await vi.dynamicImportSettled();
    await new Promise((resolve) => setTimeout(resolve));
    expect(first.isDisposed()).toBe(true);
    expect(ref.current.isDisposed()).toBe(false);
    expect(echarts.init).toHaveBeenLastCalledWith(
      expect.anything(),
      'dark-metronic',
    );
  });

  it('keeps reporting clicks on the chart drawn after a theme switch', async () => {
    const ref = createRef<any>();
    const onClick = vi.fn();
    const { rerender } = render(
      <EChart ref={ref} options={{}} onClick={onClick} />,
    );
    await waitFor(() => expect(ref.current).toBeTruthy());
    const first = ref.current;

    theme.current = 'dark';
    rerender(<EChart ref={ref} options={{}} onClick={onClick} />);
    await waitFor(() => expect(ref.current).not.toBe(first));

    ref.current.click({ name: 'batch' });
    expect(onClick).toHaveBeenCalledWith({ name: 'batch' });
  });
});
