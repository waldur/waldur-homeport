import { screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { earliestProjectEnd, ProposalExpiryHint } from './ProposalExpiryHint';

const duration = vi.hoisted(() => ({ current: null as any }));
vi.mock('@/proposals/ProjectDurationNote', () => ({
  useProjectDuration: () => duration.current,
}));

const proposal = { uuid: 'p1', call_uuid: 'c1' };

const renderHint = (expiration_time?: string) =>
  renderWithProviders(
    <Form onSubmit={vi.fn()} initialValues={{ expiration_time }}>
      {() => <ProposalExpiryHint proposal={proposal} />}
    </Form>,
  );

describe('earliestProjectEnd', () => {
  const today = DateTime.fromISO('2026-11-02T10:00:00');

  it('counts a fixed length in days and a chosen one in months from today', () => {
    expect(earliestProjectEnd({ days: 365 }, today).toISODate()).toBe(
      '2027-11-02',
    );
    expect(earliestProjectEnd({ months: 4 }, today).toISODate()).toBe(
      '2027-03-02',
    );
  });

  it('knows no end for an open-ended project', () => {
    expect(earliestProjectEnd(null, today)).toBeNull();
  });
});

describe('ProposalExpiryHint', () => {
  beforeEach(() => {
    duration.current = { days: 365 };
  });

  it('says how long the project runs', () => {
    renderHint();
    expect(
      screen.getByText('The project is expected to run for at least 365 days.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('The role ends before the project would'),
    ).not.toBeInTheDocument();
  });

  it('warns when the role ends before the project', () => {
    const tomorrow = DateTime.now().plus({ days: 1 }).toISODate();
    renderHint(tomorrow);
    expect(
      screen.getByText('The role ends before the project would'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the role is revoked on .* and the member drops out/),
    ).toBeInTheDocument();
  });

  it('is quiet when the role outlasts the project', () => {
    renderHint(DateTime.now().plus({ days: 400 }).toISODate());
    expect(
      screen.queryByText('The role ends before the project would'),
    ).not.toBeInTheDocument();
  });

  it('shows nothing for an open-ended project', () => {
    duration.current = null;
    renderHint(DateTime.now().plus({ days: 1 }).toISODate());
    expect(
      screen.queryByTestId('proposal-expiry-hint'),
    ).not.toBeInTheDocument();
  });
});
