import React from 'react';
import { vi } from 'vitest';

vi.mock('@/core/EChart', () => ({
  EChart: ({ options }) =>
    React.createElement(
      'div',
      { 'data-testid': 'echart' },
      JSON.stringify(options),
    ),
}));
