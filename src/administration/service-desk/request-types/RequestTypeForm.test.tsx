import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  supportRequestTypesAdminCreate,
  supportRequestTypesAdminPartialUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { RequestTypeForm } from './RequestTypeForm';

describe('RequestTypeForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (requestType?: any, refetch = vi.fn()) => {
    return renderWithProviders(
      <RequestTypeForm
        resolve={{
          requestType,
          refetch,
        }}
      />,
    );
  };

  it('renders create mode correctly', () => {
    renderComponent();

    expect(screen.getByText('Create request type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();

    expect(screen.getByLabelText(/^Name$/i)).toHaveValue('');
    expect(screen.getByLabelText(/Issue type name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Order/i)).toHaveValue(0);
    expect(screen.getByLabelText(/Active/i)).toBeChecked();
  });

  it('renders edit mode correctly', () => {
    const mockRequestType = {
      uuid: 'request-type-uuid',
      name: 'Test Request Type',
      issue_type_name: 'test_issue',
      order: 10,
      is_active: false,
    };

    renderComponent(mockRequestType);

    expect(screen.getByText('Edit request type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();

    expect(screen.getByLabelText(/^Name$/i)).toHaveValue('Test Request Type');
    expect(screen.getByLabelText(/Issue type name/i)).toHaveValue('test_issue');
    expect(screen.getByLabelText(/Order/i)).toHaveValue(10);
    expect(screen.getByLabelText(/Active/i)).not.toBeChecked();
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/^Name$/i), 'New Request Type');
    // Issue type name is still missing
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Issue type name/i), 'new_issue');
    expect(submitButton).not.toBeDisabled();
  });

  it('handles creation submission successfully', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(supportRequestTypesAdminCreate).mockResolvedValue({
      data: {},
    } as any);

    renderComponent(null, mockRefetch);

    await user.type(screen.getByLabelText(/^Name$/i), 'New Request Type');
    await user.type(screen.getByLabelText(/Issue type name/i), 'new_issue');
    await user.clear(screen.getByLabelText(/Order/i));
    await user.type(screen.getByLabelText(/Order/i), '5');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(supportRequestTypesAdminCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'New Request Type',
            issue_type_name: 'new_issue',
            order: 5,
            is_active: true,
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles edit submission successfully', async () => {
    const mockRefetch = vi.fn();
    const mockRequestType = {
      uuid: 'request-type-uuid',
      name: 'Old Request Type',
      issue_type_name: 'old_issue',
      order: 1,
      is_active: true,
    };

    vi.mocked(supportRequestTypesAdminPartialUpdate).mockResolvedValue({
      data: {},
    } as any);

    renderComponent(mockRequestType, mockRefetch);

    const nameInput = screen.getByLabelText(/^Name$/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Request Type');

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(supportRequestTypesAdminPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'request-type-uuid' },
          body: expect.objectContaining({
            name: 'Updated Request Type',
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('disables name and issue_type_name for synced request types', () => {
    const mockRequestType = {
      uuid: 'request-type-uuid',
      name: 'Synced Request Type',
      issue_type_name: 'synced_issue',
      is_synced: true,
    };

    renderComponent(mockRequestType);

    expect(screen.getByLabelText(/^Name$/i)).toBeDisabled();
    expect(screen.getByLabelText(/Issue type name/i)).toBeDisabled();
    expect(
      screen.getByText('Name cannot be changed for synced request types.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Issue type name cannot be changed for synced request types.',
      ),
    ).toBeInTheDocument();
  });
});
