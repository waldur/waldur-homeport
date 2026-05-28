import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { ENV } from '@/core/config';

import { PriceTooltip } from './PriceTooltip';

describe('PriceTooltip', () => {
  it('does not render anything if billing mode is activated and not estimated', () => {
    ENV.accountingMode = 'billing';
    const { container } = render(<PriceTooltip />);
    expect(container.firstChild).toBeNull();
  });

  it('renders icon if accounting mode is activated', () => {
    ENV.accountingMode = 'accounting';
    const { container } = render(<PriceTooltip />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders tooltip with correct label if accounting mode is activated', async () => {
    const user = userEvent.setup();
    ENV.accountingMode = 'accounting';
    const { container } = render(<PriceTooltip />);

    const icon = container.querySelector('svg');
    await user.hover(icon);

    await waitFor(() => {
      expect(screen.getByText('VAT is not included.')).toBeInTheDocument();
    });
  });

  it('indicates that price is estimated', async () => {
    const user = userEvent.setup();
    ENV.accountingMode = 'accounting';
    const { container } = render(<PriceTooltip estimated={true} />);

    const icon = container.querySelector('svg');
    await user.hover(icon);

    await waitFor(() => {
      expect(
        screen.getByText('VAT is not included. Price is estimated.'),
      ).toBeInTheDocument();
    });
  });

  it('renders only estimated message if billing mode is activated but price is estimated', async () => {
    const user = userEvent.setup();
    ENV.accountingMode = 'billing';
    const { container } = render(<PriceTooltip estimated={true} />);

    const icon = container.querySelector('svg');
    await user.hover(icon);

    await waitFor(() => {
      expect(screen.getByText('Price is estimated.')).toBeInTheDocument();
    });
  });
});
