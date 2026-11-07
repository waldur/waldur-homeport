import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsInviteByEmail } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { DirectEmailInviteDialog } from './DirectEmailInviteDialog';

const call = { uuid: 'call-1', name: 'Call' } as any;

const renderDialog = () =>
  renderWithProviders(
    <DirectEmailInviteDialog resolve={{ call, refetch: vi.fn() }} />,
  );

const maxAssignments = () =>
  screen.getByRole('spinbutton', { name: /Maximum assignments/ });

describe('DirectEmailInviteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsInviteByEmail).mockResolvedValue({
      data: {},
    } as any);
  });

  it('sends the default workload limit of 5', async () => {
    renderDialog();
    expect(maxAssignments()).toHaveValue(5);

    await userEvent.type(
      screen.getByRole('textbox', { name: /Email address/ }),
      'ada@example.com',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Send invitation' }),
    );

    await waitFor(() =>
      expect(proposalProtectedCallsInviteByEmail).toHaveBeenCalledWith({
        path: { uuid: 'call-1' },
        body: {
          email: 'ada@example.com',
          invitation_message: undefined,
          max_assignments: 5,
        },
      }),
    );
  });

  it('sends the workload limit the manager enters', async () => {
    renderDialog();

    await userEvent.type(
      screen.getByRole('textbox', { name: /Email address/ }),
      'ada@example.com',
    );
    await userEvent.clear(maxAssignments());
    await userEvent.type(maxAssignments(), '8');
    await userEvent.click(
      screen.getByRole('button', { name: 'Send invitation' }),
    );

    await waitFor(() =>
      expect(proposalProtectedCallsInviteByEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ max_assignments: 8 }),
        }),
      ),
    );
  });
});
