import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';

import { ENV } from '@/core/config';

import { PriceTooltip } from './PriceTooltip';

describe('PriceTooltip', () => {
  const originalAccountingMode = ENV.accountingMode;

  beforeEach(() => {
    ENV.accountingMode = originalAccountingMode;
  });

  it('does not render anything if billing mode is activated and not estimated', () => {
    ENV.accountingMode = 'billing';
    const { container } = render(<PriceTooltip />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders icon if accounting mode is activated', () => {
    ENV.accountingMode = 'accounting';
    render(<PriceTooltip />);
    expect(screen.getByTestId('WarningCircleIcon')).toBeInTheDocument();
  });

  it('renders tooltip with correct label if accounting mode is activated', async () => {
    const user = userEvent.setup();
    ENV.accountingMode = 'accounting';
    render(<PriceTooltip />);

    const icon = screen.getByTestId('WarningCircleIcon');
    await user.hover(icon);

    await waitFor(() => {
      expect(screen.getByText('VAT is not included.')).toBeInTheDocument();
    });
  });

  it('indicates that price is estimated', async () => {
    const user = userEvent.setup();
    ENV.accountingMode = 'accounting';
    render(<PriceTooltip estimated={true} />);

    const icon = screen.getByTestId('WarningCircleIcon');
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
    render(<PriceTooltip estimated={true} />);

    const icon = screen.getByTestId('WarningCircleIcon');
    await user.hover(icon);

    await waitFor(() => {
      expect(screen.getByText('Price is estimated.')).toBeInTheDocument();
    });
  });
});
