import { render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const echarts = vi.hoisted(() => {
  const makeChart = () => {
    let disposed = false;
    return {
      setOption: vi.fn(),
      resize: vi.fn(),
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
    expect(first.isDisposed()).toBe(true);
    expect(ref.current.isDisposed()).toBe(false);
    expect(echarts.init).toHaveBeenLastCalledWith(
      expect.anything(),
      'dark-metronic',
    );
  });
});
