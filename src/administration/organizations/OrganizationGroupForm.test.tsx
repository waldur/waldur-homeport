import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  organizationGroupsCreate,
  organizationGroupsList,
  organizationGroupsUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import {
  clearSelect,
  getSelectByLabel,
  openAndSelectOption,
} from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { OrganizationGroupForm } from './OrganizationGroupForm';

describe('OrganizationGroupForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationGroupsList).mockResolvedValue(mockListResponse([]));
  });

  const renderComponent = (props = {}) => {
    return renderWithProviders(
      <OrganizationGroupForm
        resolve={{
          refetch: vi.fn(),
          ...props,
        }}
      />,
    );
  };

  it('renders create mode correctly', async () => {
    renderComponent();

    expect(screen.getByText('Create organization group')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveValue('');

    const parentSelectContainer = getSelectByLabel('Parent group');
    await waitFor(() => {
      expect(
        within(parentSelectContainer).getByText('Select organization group...'),
      ).toBeInTheDocument();
    });
  });

  it('renders edit mode correctly', async () => {
    const mockGroup = {
      uuid: 'group-uuid',
      name: 'Child Group',
      parent: 'http://example.com/parent-group/',
      parent_name: 'Parent Group',
    };

    renderComponent({ organizationGroup: mockGroup });

    expect(screen.getByText('Edit Child Group')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveValue('Child Group');

    const parentSelectContainer = getSelectByLabel('Parent group');
    await waitFor(() => {
      expect(
        within(parentSelectContainer).getByText('Parent Group'),
      ).toBeInTheDocument();
    });
  });

  it('prevents submission if required name field is missing', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeDisabled();

    // Type name and expect it to be enabled
    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'New Group');
    expect(submitButton).not.toBeDisabled();

    // Clear name and expect it to be disabled again
    await user.clear(nameInput);
    expect(submitButton).toBeDisabled();
  });

  it('handles creation submission successfully', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(organizationGroupsList).mockResolvedValue(
      mockListResponse([
        {
          url: 'http://example.com/parent-group-1/',
          name: 'Parent One',
          uuid: 'parent-1',
        },
      ]),
    );
    vi.mocked(organizationGroupsCreate).mockResolvedValue({ data: {} } as any);

    renderComponent({ refetch: mockRefetch });

    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'New Group');

    // Select parent group from the dropdown
    await openAndSelectOption(user, 'Parent group', 'Parent One');

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(organizationGroupsCreate).toHaveBeenCalledWith({
        body: {
          name: 'New Group',
          parent: 'http://example.com/parent-group-1/',
        },
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles edit submission successfully', async () => {
    const mockRefetch = vi.fn();
    const mockGroup = {
      uuid: 'group-uuid',
      name: 'Child Group',
      parent: 'http://example.com/parent-group/',
      parent_name: 'Parent Group',
    };

    vi.mocked(organizationGroupsList).mockResolvedValue(
      mockListResponse([
        {
          url: 'http://example.com/parent-group-2/',
          name: 'Parent Two',
          uuid: 'parent-2',
        },
      ]),
    );
    vi.mocked(organizationGroupsUpdate).mockResolvedValue({ data: {} } as any);

    renderComponent({
      organizationGroup: mockGroup,
      refetch: mockRefetch,
    });

    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Group');

    // Clear current parent group select selection
    await clearSelect(user, 'Parent group');

    // Select new parent group
    await openAndSelectOption(user, 'Parent group', 'Parent Two');

    const submitButton = screen.getByRole('button', { name: 'Edit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(organizationGroupsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'group-uuid' },
        body: {
          name: 'Updated Group',
          parent: 'http://example.com/parent-group-2/',
        },
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });
});
