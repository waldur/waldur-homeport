import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionRequestActionDialog } from './PermissionRequestActionDialog';
import {
  useApprovePermissionRequest,
  useRejectPermissionRequest,
} from './useUserPermissionRequestActions';

vi.mock('./useUserPermissionRequestActions', () => ({
  useApprovePermissionRequest: vi.fn(),
  useRejectPermissionRequest: vi.fn(),
}));

vi.mock('@/core/dateUtils', () => ({
  formatDateTime: (date) => date,
}));

vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children }) => <span>{children}</span>,
}));

describe('PermissionRequestActionDialog', () => {
  const permissionRequest = {
    uuid: 'test-uuid',
    created_by_full_name: 'John Doe',
    created_by_email: 'john@example.com',
    customer_name: 'Test Org',
    role_name: 'CUSTOMER.OWNER',
    created: '2023-01-01',
  };

  const mockApprove = vi.fn();
  const mockReject = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApprovePermissionRequest).mockReturnValue({
      approveRequest: mockApprove,
      isPending: false,
    });
    vi.mocked(useRejectPermissionRequest).mockReturnValue({
      rejectRequest: mockReject,
      isPending: false,
    });
  });

  it('renders request details correctly', () => {
    render(
      <PermissionRequestActionDialog
        resolve={{ permissionRequest, readOnly: false, refetch: mockRefetch }}
      />,
    );

    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Reason')).toBeInTheDocument();
  });

  it('renders project details when role is PROJECT.*', () => {
    const projectRequest = {
      ...permissionRequest,
      role_name: 'PROJECT.ADMIN',
      scope_name: 'Test Project',
      project_name_template: 'Template-{name}',
      project_name: 'Requested Project',
      project_description: 'Project description',
    };
    render(
      <PermissionRequestActionDialog
        resolve={{
          permissionRequest: projectRequest,
          readOnly: false,
          refetch: mockRefetch,
        }}
      />,
    );

    expect(screen.getByText('Project:')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Project role:')).toBeInTheDocument();
    expect(screen.getByText('PROJECT.ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Project name template:')).toBeInTheDocument();
    expect(screen.getByText('Template-{name}')).toBeInTheDocument();
    expect(screen.getByText('Requested project name:')).toBeInTheDocument();
    expect(screen.getByText('Requested Project')).toBeInTheDocument();
    expect(
      screen.getByText('Requested project description:'),
    ).toBeInTheDocument();
    expect(screen.getByText('Project description')).toBeInTheDocument();
  });

  it('calls approveRequest on Approve button click', async () => {
    render(
      <PermissionRequestActionDialog
        resolve={{ permissionRequest, readOnly: false, refetch: mockRefetch }}
      />,
    );

    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Looks good' },
    });
    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledWith('Looks good');
    });
  });

  it('calls rejectRequest on Decline button click', async () => {
    render(
      <PermissionRequestActionDialog
        resolve={{ permissionRequest, readOnly: false, refetch: mockRefetch }}
      />,
    );

    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Not eligible' },
    });
    fireEvent.click(screen.getByText('Decline'));

    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith('Not eligible');
    });
  });

  it('disables buttons when pending', () => {
    vi.mocked(useApprovePermissionRequest).mockReturnValue({
      approveRequest: mockApprove,
      isPending: true,
    });

    render(
      <PermissionRequestActionDialog
        resolve={{ permissionRequest, readOnly: false, refetch: mockRefetch }}
      />,
    );

    expect(screen.getByText('Approve').closest('button')).toBeDisabled();
    expect(screen.getByText('Decline').closest('button')).toBeDisabled();
  });

  it('renders in readOnly mode', () => {
    const reviewedRequest = {
      ...permissionRequest,
      reviewed_at: '2023-01-02',
      review_comment: 'Approved for testing',
    };
    render(
      <PermissionRequestActionDialog
        resolve={{
          permissionRequest: reviewedRequest,
          readOnly: true,
          refetch: mockRefetch,
        }}
      />,
    );

    expect(screen.queryByLabelText('Reason')).not.toBeInTheDocument();
    expect(screen.getByText('Approved for testing')).toBeInTheDocument();
    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Decline')).not.toBeInTheDocument();
  });
});
