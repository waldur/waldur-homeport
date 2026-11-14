import React from 'react';
import { vi } from 'vitest';

// A vi.fn, so a test can read the options a chart was drawn with
// (vi.mocked(EChart).mock.lastCall[0].options), formatter functions included:
// the rendered JSON leaves functions out.
vi.mock('@/core/EChart', () => ({
  EChart: vi.fn(({ options }) =>
    React.createElement(
      'div',
      { 'data-testid': 'echart' },
      JSON.stringify(options),
    ),
  ),
}));
