import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { SpendingLimitStatusCard } from './SpendingLimitStatusCard';

const inHours = (hours: number) => DateTime.now().plus({ hours }).toISO();

const status = (overrides = {}) => ({
  component_type: 'token_cost',
  period: 'day' as const,
  limit: 20,
  used: 15,
  resets_at: inHours(5),
  reached: false,
  last_reported_at: inHours(-2),
  ...overrides,
});

const baseResource = {
  usage_limit_restriction: '' as const,
  usage_limit_resumes_at: null,
  offering_components: [
    { type: 'token_cost', name: 'Token cost', measured_unit: 'EUR' },
  ] as any,
};

describe('SpendingLimitStatusCard', () => {
  it('renders nothing without spending limits', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{ ...baseResource, spending_limit_status: [] }}
      />,
    );
    expect(screen.queryByText('Spending limits')).not.toBeInTheDocument();
  });

  it('shows used of limit, the reset time and the last report', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          spending_limit_status: [
            status(),
            status({ period: 'month', limit: 300, used: 142 }),
          ],
        }}
      />,
    );
    const day = screen.getByTestId('spending-limit-status-token_cost-day');
    expect(day).toHaveTextContent('Daily limit');
    expect(day).toHaveTextContent('15 / 20 EUR');
    expect(day).toHaveTextContent('Resets in 5 hours');
    expect(
      screen.getByTestId('spending-limit-status-token_cost-month'),
    ).toHaveTextContent('142 / 300 EUR');
    expect(
      screen.getByText('Usage last reported 2 hours ago'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('spending-limit-restriction'),
    ).not.toBeInTheDocument();
  });

  it('says no usage was reported yet', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          spending_limit_status: [status({ last_reported_at: null })],
        }}
      />,
    );
    expect(screen.getByText('No usage reported yet')).toBeInTheDocument();
  });

  it('names the limit that pauses the resource and when access resumes', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          usage_limit_restriction: 'paused',
          usage_limit_resumes_at: inHours(5),
          spending_limit_status: [
            status({ used: 20, reached: true }),
            status({ period: 'month', limit: 300, used: 142 }),
          ],
        }}
      />,
    );
    const notice = screen.getByTestId('spending-limit-restriction');
    expect(notice).toHaveTextContent(
      'Access is paused: a spending limit is reached',
    );
    expect(notice).toHaveTextContent('Held by: Token cost — Daily limit.');
    expect(notice).toHaveTextContent('Access resumes in 5 hours');
    expect(screen.getByText('Reached')).toBeInTheDocument();
  });

  it('says access resumes shortly once the reset time has passed', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          usage_limit_restriction: 'paused',
          usage_limit_resumes_at: inHours(-1),
          spending_limit_status: [status({ used: 20, reached: true })],
        }}
      />,
    );
    expect(screen.getByTestId('spending-limit-restriction')).toHaveTextContent(
      'Access resumes shortly.',
    );
  });

  it('speaks of the restriction, not access, for a downscaled resource', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          usage_limit_restriction: 'downscaled',
          usage_limit_resumes_at: inHours(5),
          spending_limit_status: [status({ used: 20, reached: true })],
        }}
      />,
    );
    expect(screen.getByTestId('spending-limit-restriction')).toHaveTextContent(
      'The restriction lifts in 5 hours',
    );
  });

  it('says an all-time limit never resets', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          spending_limit_status: [
            status({
              period: 'total',
              limit: 5000,
              used: 1200,
              resets_at: null,
            }),
          ],
        }}
      />,
    );
    const total = screen.getByTestId('spending-limit-status-token_cost-total');
    expect(total).toHaveTextContent('All-time limit');
    expect(total).toHaveTextContent('1200 / 5000 EUR');
    expect(total).toHaveTextContent('Never resets');
    expect(total).not.toHaveTextContent('Resets');
  });

  // The backend sets no resume time while a reached total holds the resource.
  it('says a reached all-time limit holds until it is raised or cleared', () => {
    const reachedTotal = status({
      period: 'total',
      limit: 5000,
      used: 5000,
      resets_at: null,
      reached: true,
    });
    const { unmount } = renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          usage_limit_restriction: 'paused',
          usage_limit_resumes_at: null,
          spending_limit_status: [
            status({ used: 20, reached: true }),
            reachedTotal,
          ],
        }}
      />,
    );
    const notice = screen.getByTestId('spending-limit-restriction');
    expect(notice).toHaveTextContent(
      'Held by: Token cost — Daily limit; Token cost — All-time limit.',
    );
    expect(notice).toHaveTextContent(
      'Access stays paused until the all-time limit is raised or cleared.',
    );
    unmount();

    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          usage_limit_restriction: 'downscaled',
          usage_limit_resumes_at: null,
          spending_limit_status: [reachedTotal],
        }}
      />,
    );
    expect(screen.getByTestId('spending-limit-restriction')).toHaveTextContent(
      'The restriction stays until the all-time limit is raised or cleared.',
    );
  });

  it('shows no restriction while none is applied, even if a limit is reached', () => {
    renderWithProviders(
      <SpendingLimitStatusCard
        resource={{
          ...baseResource,
          spending_limit_status: [status({ used: 20, reached: true })],
        }}
      />,
    );
    expect(
      screen.queryByTestId('spending-limit-restriction'),
    ).not.toBeInTheDocument();
  });
});
