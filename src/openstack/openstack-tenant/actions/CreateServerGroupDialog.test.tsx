import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackTenantsCreateServerGroup } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CreateServerGroupDialog } from './CreateServerGroupDialog';

// Mock dependencies

const mockResource = {
  uuid: 'tenant-uuid',
  name: 'test-tenant',
  url: 'tenant-url',
};
const renderDialog = (refetch = vi.fn()) => {
  return renderWithProviders(
    <CreateServerGroupDialog
      resolve={{ resource: mockResource as any, refetch }}
    />,
  );
};

describe('CreateServerGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderDialog();

    expect(
      screen.getByText('Create server group for OpenStack tenant test-tenant'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText('Policy')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderDialog();

    const nameInput = screen.getByLabelText('Name');
    await user.click(nameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This field is required.')).toBeInTheDocument();
    });
  });

  it('validates latin name characters', async () => {
    const user = userEvent.setup();
    renderDialog();

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'имя'); // Cyrillic characters
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Name should consist of latin symbols and numbers.'),
      ).toBeInTheDocument();
    });
  });

  it('submits correctly with valid data', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    vi.mocked(openstackTenantsCreateServerGroup).mockResolvedValue({
      data: {},
    } as any);

    renderDialog(mockRefetch);

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'test-server-group');

    // Policy has initial value 'affinity'
    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    expect(openstackTenantsCreateServerGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'tenant-uuid' },
        body: expect.objectContaining({
          name: 'test-server-group',
          policy: 'affinity',
        }),
      }),
    );
  });

  it('handles API submission failure gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackTenantsCreateServerGroup).mockRejectedValue(
      new Error('API Error'),
    );

    renderDialog();

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'failed-group');

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackTenantsCreateServerGroup).toHaveBeenCalled();
    });
  });
});
