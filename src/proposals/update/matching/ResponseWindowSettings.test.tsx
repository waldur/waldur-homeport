import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsAssignmentConfigurationRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ResponseWindowSettings } from './ResponseWindowSettings';

describe('ResponseWindowSettings', () => {
  it('shows how long reviewers have to answer, and the reminder', async () => {
    vi.mocked(
      proposalProtectedCallsAssignmentConfigurationRetrieve,
    ).mockResolvedValue({
      data: {
        assignment_expiration_days: 10,
        send_reminder_before_expiry_days: 2,
      },
    } as any);
    renderWithProviders(
      <ResponseWindowSettings call={{ uuid: 'call-uuid' } as any} />,
    );
    expect(await screen.findByText('Days to respond')).toBeInTheDocument();
    expect(screen.getByText('10 days')).toBeInTheDocument();
    expect(screen.getByText('2 days before')).toBeInTheDocument();
    expect(
      proposalProtectedCallsAssignmentConfigurationRetrieve,
    ).toHaveBeenCalledWith({ path: { uuid: 'call-uuid' } });
  });
});
