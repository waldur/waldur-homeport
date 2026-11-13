import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, it, expect } from 'vitest';

import { ENV } from '@/core/config';

import { PriceTooltip } from './PriceTooltip';

describe('PriceTooltip', () => {
  const originalFeatures = ENV.FEATURES;

  const setBillingMode = (enabled: boolean) => {
    ENV.FEATURES = { customer: { show_invoices_with_vat: enabled } };
  };

  afterEach(() => {
    ENV.FEATURES = originalFeatures;
  });

  it('does not render anything if billing mode is activated and not estimated', () => {
    setBillingMode(true);
    const { container } = render(<PriceTooltip />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders icon if accounting mode is activated', () => {
    setBillingMode(false);
    render(<PriceTooltip />);
    expect(screen.getByTestId('WarningCircleIcon')).toBeInTheDocument();
  });

  it('renders tooltip with correct label if accounting mode is activated', async () => {
    const user = userEvent.setup();
    setBillingMode(false);
    render(<PriceTooltip />);

    const icon = screen.getByTestId('WarningCircleIcon');
    await user.hover(icon);

    await waitFor(() => {
      expect(screen.getByText('VAT is not included.')).toBeInTheDocument();
    });
  });

  it('indicates that price is estimated', async () => {
    const user = userEvent.setup();
    setBillingMode(false);
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
    setBillingMode(true);
    render(<PriceTooltip estimated={true} />);

    const icon = screen.getByTestId('WarningCircleIcon');
    await user.hover(icon);

    await waitFor(() => {
      expect(screen.getByText('Price is estimated.')).toBeInTheDocument();
    });
  });
});
