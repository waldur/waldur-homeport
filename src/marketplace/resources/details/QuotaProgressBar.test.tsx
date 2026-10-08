import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { QuotaProgressBar } from './QuotaProgressBar';

describe('QuotaProgressBar', () => {
  it('names the progressbar element', () => {
    render(<QuotaProgressBar percent={40} label="CPU Cores" />);

    const bar = screen.getByRole('progressbar', { name: 'CPU Cores' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
  });
});
