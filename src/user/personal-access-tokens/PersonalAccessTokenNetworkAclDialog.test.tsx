import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { personalAccessTokensSetNetworkAcl } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { PersonalAccessTokenNetworkAclDialog } from './PersonalAccessTokenNetworkAclDialog';

describe('PersonalAccessTokenNetworkAclDialog', () => {
  const refetch = vi.fn();

  const renderComponent = (allowed_networks: string[] = []) =>
    renderWithProviders(
      <PersonalAccessTokenNetworkAclDialog
        resolve={{
          row: { uuid: 'tok-uuid', name: 'ci token', allowed_networks },
          refetch,
        }}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prefills the field with the current ACL', () => {
    renderComponent(['203.0.113.0/24', '198.51.100.7/32']);
    expect(screen.getByLabelText(/Allowed networks/i)).toHaveValue(
      '203.0.113.0/24, 198.51.100.7/32',
    );
  });

  it('splits the comma-separated list into an array for the API', async () => {
    const user = userEvent.setup();
    vi.mocked(personalAccessTokensSetNetworkAcl).mockResolvedValue({} as any);
    renderComponent([]);

    await user.type(
      screen.getByLabelText(/Allowed networks/i),
      ' 203.0.113.0/24 , 10.0.0.0/8 ,',
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(personalAccessTokensSetNetworkAcl).toHaveBeenCalledWith({
        path: { uuid: 'tok-uuid' },
        body: { allowed_networks: ['203.0.113.0/24', '10.0.0.0/8'] },
      });
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('submits an empty list when the field is cleared, lifting the restriction', async () => {
    const user = userEvent.setup();
    vi.mocked(personalAccessTokensSetNetworkAcl).mockResolvedValue({} as any);
    renderComponent(['203.0.113.0/24']);

    await user.clear(screen.getByLabelText(/Allowed networks/i));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(personalAccessTokensSetNetworkAcl).toHaveBeenCalledWith({
        path: { uuid: 'tok-uuid' },
        body: { allowed_networks: [] },
      });
    });
  });

  it('keeps the dialog open and does not refetch when the backend rejects the ACL', async () => {
    const user = userEvent.setup();
    // The backend validator owns CIDR rules; a host-bits entry comes back 400.
    vi.mocked(personalAccessTokensSetNetworkAcl).mockRejectedValue({
      response: { status: 400 },
    });
    renderComponent([]);

    await user.type(
      screen.getByLabelText(/Allowed networks/i),
      '203.0.113.5/24',
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(personalAccessTokensSetNetworkAcl).toHaveBeenCalled();
    });
    expect(refetch).not.toHaveBeenCalled();
  });
});
