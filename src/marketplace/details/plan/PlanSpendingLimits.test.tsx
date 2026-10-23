import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { getDefaultSpendingLimits } from '@/marketplace/common/spendingLimits';
import { renderWithProviders } from '@/test/harness';

import { formatOrderForCreate } from '../utils';

import { PlanSpendingLimits } from './PlanSpendingLimits';

const tokenCost = {
  type: 'token_cost',
  name: 'Token cost',
  billing_type: 'usage',
  measured_unit: 'EUR',
  spending_limit_periods: {
    day: { default: 20, maximum: 100 },
    week: {},
    month: { default: 300 },
  },
};

const cores = {
  type: 'cores',
  name: 'Cores',
  billing_type: 'limit',
  measured_unit: 'cores',
  spending_limit_periods: {},
};

const offering: any = {
  type: 'Marketplace.Basic',
  url: 'https://example.com/api/marketplace-offerings/1/',
  components: [tokenCost, cores],
  plugin_options: { action_on_usage_limit: 'pause' },
};

const renderSection = (initialValues = {}, section = offering) => {
  const onSubmit = vi.fn();
  const view = renderWithProviders(
    <Form
      onSubmit={onSubmit}
      initialValues={{
        spending_limits: getDefaultSpendingLimits(offering.components),
        ...initialValues,
      }}
    >
      {({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <PlanSpendingLimits offering={section} />
          <button type="submit" disabled={invalid}>
            Submit
          </button>
        </form>
      )}
    </Form>,
  );
  return { ...view, onSubmit };
};

const getInput = (period: string) =>
  screen.getByRole('spinbutton', { name: new RegExp(`^${period} limit`) });

describe('PlanSpendingLimits', () => {
  it('shows one field per offered period, pre-filled with the default', () => {
    renderSection();
    expect(getInput('Daily')).toHaveValue(20);
    expect(getInput('Weekly')).toHaveValue(null);
    expect(getInput('Monthly')).toHaveValue(300);
    expect(
      screen.queryByRole('spinbutton', { name: /Quarterly limit/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the reset time beside each field and the enforcement notice', () => {
    renderSection();
    expect(screen.getByText('resets 00:00 UTC')).toBeInTheDocument();
    expect(screen.getByText('resets Monday 00:00 UTC')).toBeInTheDocument();
    expect(screen.getByText('resets on the 1st')).toBeInTheDocument();
    expect(
      screen.getByText(
        'When a limit is reached, access pauses until that limit resets. Limits are checked each time the provider reports usage, so spending can briefly go over one.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Up to 100')).toBeInTheDocument();
  });

  it('does not promise a pause the offering does not apply', () => {
    renderSection({}, { ...offering, plugin_options: {} });
    expect(
      screen.getByText(
        'Reaching a limit is reported but does not pause access.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/access pauses/)).not.toBeInTheDocument();
  });

  it('says the resource is downscaled when the offering downscales', () => {
    renderSection(
      {},
      { ...offering, plugin_options: { action_on_usage_limit: 'downscale' } },
    );
    expect(
      screen.getByText(/the resource is downscaled until that limit resets/),
    ).toBeInTheDocument();
  });

  it('renders nothing when no component takes spending limits', () => {
    renderWithProviders(
      <Form onSubmit={vi.fn()}>
        {() => (
          <PlanSpendingLimits offering={{ ...offering, components: [cores] }} />
        )}
      </Form>,
    );
    expect(
      screen.queryByTestId('plan-spending-limits'),
    ).not.toBeInTheDocument();
  });

  it('rejects an amount above the maximum', async () => {
    const user = userEvent.setup();
    renderSection();
    const day = getInput('Daily');
    await user.clear(day);
    await user.type(day, '150');
    expect(day).toHaveAttribute('aria-invalid', 'true');
    expect(day).toHaveAccessibleDescription('Must not exceed 100.');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('rejects more than two decimal places', async () => {
    const user = userEvent.setup();
    renderSection();
    const week = getInput('Weekly');
    await user.type(week, '30.125');
    expect(week).toHaveAccessibleDescription('Use at most 2 decimal places.');
  });

  it('rejects a shorter period above a longer one', async () => {
    const user = userEvent.setup();
    renderSection();
    const week = getInput('Weekly');
    await user.type(week, '10');
    // The daily default (20) is now above the weekly limit.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled(),
    );
    expect(getInput('Daily')).toHaveAccessibleDescription(
      'Must not exceed the amount for the week (10).',
    );
  });

  it('submits the typed amounts, and an order sends them as spending_limits', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderSection();
    const day = getInput('Daily');
    await user.clear(day);
    await user.type(day, '25.5');
    await user.clear(getInput('Monthly'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const values = onSubmit.mock.calls[0][0];
    expect(formatOrderForCreate(offering, values).spending_limits).toEqual({
      token_cost: { day: 25.5 },
    });
  });
});

describe('formatOrderForCreate spending limits', () => {
  it('leaves spending_limits out when none is set', () => {
    const body = formatOrderForCreate(offering, {
      spending_limits: { token_cost: { day: '' } },
    });
    expect(body).not.toHaveProperty('spending_limits');
  });

  it('drops components the chosen plan bills by limit', () => {
    const body = formatOrderForCreate(offering, {
      plan: {
        url: 'https://example.com/api/plans/1/',
        components: [{ type: 'token_cost', billing_type: 'limit' }],
      } as any,
      spending_limits: { token_cost: { day: 20 } },
    });
    expect(body).not.toHaveProperty('spending_limits');
  });
});
