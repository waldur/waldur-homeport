import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { QuotaProgressBar } from './QuotaProgressBar';

describe('QuotaProgressBar', () => {
  it('names the progressbar element', () => {
    render(<QuotaProgressBar percent={40} label="CPU Cores" />);

    const bar = screen.getByRole('progressbar', { name: 'CPU Cores' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
  });

  it('reports 0 for a 0/0 quota instead of NaN', () => {
    render(<QuotaProgressBar percent={NaN} label="Input tokens" />);

    expect(
      screen.getByRole('progressbar', { name: 'Input tokens' }),
    ).toHaveAttribute('aria-valuenow', '0');
  });
});
