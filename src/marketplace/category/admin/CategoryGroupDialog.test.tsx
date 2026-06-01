import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCategoryGroupsCreate,
  marketplaceCategoryGroupsPartialUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CategoryGroupDialog } from './CategoryGroupDialog';

const renderDialog = (categoryGroup?: any) => {
  return renderWithProviders(
    <CategoryGroupDialog
      resolve={{ categoryGroup: categoryGroup, refetch: vi.fn() }}
    />,
  );
};

describe('CategoryGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Create" mode title when no group is provided', () => {
    renderDialog();
    expect(screen.getByText('Create category group')).toBeInTheDocument();
  });

  it('renders "Edit" mode title when a group is provided', () => {
    const categoryGroup = { uuid: 'uuid', title: 'Group 1' };
    renderDialog(categoryGroup);
    expect(screen.getByText('Edit Group 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Group 1')).toBeInTheDocument();
  });

  it('calls marketplaceCategoryGroupsCreate on submission in create mode', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceCategoryGroupsCreate).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Title/i), 'New Group');
    await user.type(screen.getByLabelText(/Description/i), 'Some description');

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(marketplaceCategoryGroupsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            title: 'New Group',
            description: 'Some description',
          }),
        }),
      );
    });
  });

  it('calls marketplaceCategoryGroupsPartialUpdate on submission in edit mode', async () => {
    const user = userEvent.setup();
    const categoryGroup = { uuid: 'uuid', title: 'Old Title', description: '' };
    vi.mocked(marketplaceCategoryGroupsPartialUpdate).mockResolvedValue(
      {} as any,
    );
    renderDialog(categoryGroup);

    const titleInput = screen.getByDisplayValue('Old Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    await user.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(marketplaceCategoryGroupsPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'uuid' },
          body: expect.objectContaining({
            title: 'New Title',
          }),
        }),
      );
    });
  });

  it('disables submit button if title is missing', () => {
    renderDialog();
    const submitButton = screen.getByText('Create');
    expect(submitButton).toBeDisabled();
  });

  it('handles image upload', async () => {
    const user = userEvent.setup();
    renderDialog();

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('image-input') as HTMLInputElement;

    await user.upload(input, file);

    expect(screen.getByText('Replace')).toBeInTheDocument();
  });
});
