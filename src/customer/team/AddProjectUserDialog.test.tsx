import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsAddUser } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { AddProjectUserDialog } from './AddProjectUserDialog';

vi.mock('../workspace/fetchCustomer', () => ({
  useCustomerProjects: () => ({ loading: false }),
}));

const renderComponent = (customer, refetch = vi.fn()) => {
  return renderWithProviders(
    <AddProjectUserDialog resolve={{ customer, refetch }} />,
  );
};

describe('AddProjectUserDialog', () => {
  const mockCustomer = {
    uuid: 'user-uuid',
    full_name: 'John Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCustomer).mockReturnValue({
      projects: [
        { uuid: 'project-uuid', name: 'Test Project', url: 'project-url' },
      ],
    } as any);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-uuid',
      is_staff: true,
    } as any);
    vi.mocked(useProject).mockReturnValue({ uuid: 'project-uuid' } as any);
  });

  it('renders dialog correctly', () => {
    renderComponent(mockCustomer);
    expect(screen.getByText('Add project role')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Role expires on')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsAddUser).mockResolvedValue({ data: {} } as any);
    renderComponent(mockCustomer);

    // Fill the form
    // Project Select
    await openAndSelectOption(user, 'Project', 'Test Project');

    // Role Select
    await openAndSelectOption(user, 'Role', 'Administrator');

    // Expiration Date
    const dateInput = await screen.findByLabelText('Role expires on');
    await user.type(dateInput, '2025-01-01');

    // Submit
    const submitButton = await screen.findByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(projectsAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            user: 'user-uuid',
            role: 'admin',
            expiration_time: '2025-01-01',
          }),
        }),
      );
    });
  });
});
