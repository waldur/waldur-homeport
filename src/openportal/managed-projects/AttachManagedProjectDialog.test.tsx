import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openportalManagedProjectsAttach,
  openportalUnmanagedProjectsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { AttachManagedProjectDialog } from './AttachManagedProjectDialog';

// Mock permissions
vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

const mockProject = {
  identifier: 'proj-id',
  destination: 'dest-id',
  project_template_data: {
    customer_data: {
      uuid: 'target-customer-uuid',
      name: 'Target Customer',
    },
  },
};

const renderComponent = (resolve = { refetch: vi.fn() }) => {
  return renderWithProviders(
    <AttachManagedProjectDialog
      project={mockProject as any}
      resolve={resolve as any}
    />,
  );
};

describe('AttachManagedProjectDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openportalUnmanagedProjectsList).mockResolvedValue(
      mockListResponse([
        { uuid: 'unmanaged-1', name: 'Project Alpha' },
        { uuid: 'unmanaged-2', name: 'Project Beta' },
      ]),
    );
  });

  it('renders correctly and shows target customer in label', () => {
    renderComponent();

    expect(screen.getByText('Attach Project')).toBeInTheDocument();
    expect(screen.getByText(/Choose a project to attach/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Customer/i)).toBeInTheDocument();
  });

  it('allows selecting a project via AsyncSelect', async () => {
    renderComponent();

    const select = screen.getByLabelText(/Choose a project to attach/i);
    await user.click(select);

    // Wait for options to load and select one
    const option = await screen.findByText('Project Alpha');
    await user.click(option);

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const refetch = vi.fn();
    vi.mocked(openportalManagedProjectsAttach).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({ refetch });

    // Select a project
    const select = screen.getByLabelText(/Choose a project to attach/i);
    await user.click(select);
    const option = await screen.findByText('Project Beta');
    await user.click(option);

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Attach' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(openportalManagedProjectsAttach).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { identifier: 'proj-id', destination: 'dest-id' },
          body: { project_uuid: 'unmanaged-2' },
        }),
      );
    });

    expect(refetch).toHaveBeenCalled();
  });

  it('handles missing project template data', () => {
    const brokenProject = { ...mockProject, project_template_data: null };
    renderWithProviders(
      <AttachManagedProjectDialog
        project={brokenProject as any}
        resolve={{ refetch: vi.fn() } as any}
      />,
    );

    expect(
      screen.getByText('Project template data is not available.'),
    ).toBeInTheDocument();
  });
});
