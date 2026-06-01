import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCategoriesCreate,
  marketplaceCategoriesRetrieve,
  marketplaceCategoriesUpdate,
  marketplaceCategoryGroupsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { CategoryEditDialog } from './CategoryEditDialog';

describe('CategoryEditDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceCategoryGroupsList).mockResolvedValue(
      mockListResponse([{ uuid: 'group-1', title: 'Group 1', url: 'url-1' }]),
    );
  });

  const renderComponent = (category?: any, refetch = vi.fn()) => {
    return renderWithProviders(
      <CategoryEditDialog
        resolve={{
          category,
          refetch,
        }}
      />,
    );
  };

  it('renders create mode correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Create category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();

    expect(screen.getByLabelText(/Title/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.getByText(/Upload an image/i)).toBeInTheDocument();
  });

  it('renders edit mode correctly', async () => {
    const mockCategory = {
      uuid: 'cat-uuid',
      title: 'Test Category',
      description: 'Test Description',
      icon: 'test-icon.png',
      group: 'url-1',
    };

    vi.mocked(marketplaceCategoriesRetrieve).mockResolvedValue({
      data: mockCategory,
    } as any);

    renderComponent({ uuid: 'cat-uuid' });

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Edit Test Category')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toHaveValue('Test Category');
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      'Test Description',
    );
    expect(screen.getByText('Group 1')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Title/i), 'New Category');
    expect(submitButton).not.toBeDisabled();

    await user.clear(screen.getByLabelText(/Title/i));
    expect(submitButton).toBeDisabled();
  });

  it('handles creation submission successfully', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(marketplaceCategoriesCreate).mockResolvedValue({
      data: { uuid: 'new-uuid' },
    } as any);

    renderComponent(null, mockRefetch);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Title/i), 'New Category');
    await user.type(screen.getByLabelText(/Description/i), 'New Description');

    // Select group
    await openAndSelectOption(user, 'Group', 'Group 1');

    // Checkboxes
    await user.click(screen.getByLabelText(/Default volume category/i));

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(marketplaceCategoriesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            title: 'New Category',
            description: 'New Description',
            group: 'url-1',
            default_volume_category: true,
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles edit submission successfully', async () => {
    const mockRefetch = vi.fn();
    const mockCategory = {
      uuid: 'cat-uuid',
      title: 'Old Category',
    };

    vi.mocked(marketplaceCategoriesRetrieve).mockResolvedValue({
      data: mockCategory,
    } as any);
    vi.mocked(marketplaceCategoriesUpdate).mockResolvedValue({
      data: mockCategory,
    } as any);

    renderComponent({ uuid: 'cat-uuid' }, mockRefetch);

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Title/i)).toHaveValue('Old Category');

    await user.clear(screen.getByLabelText(/Title/i));
    await user.type(screen.getByLabelText(/Title/i), 'Updated Category');

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    await waitFor(() => {
      expect(marketplaceCategoriesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'cat-uuid' },
          body: expect.objectContaining({
            title: 'Updated Category',
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles image upload', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('image-input') as HTMLInputElement;

    await user.upload(input, file);

    // After upload, the "Replace" button should appear instead of "Upload"
    expect(screen.getByText('Replace')).toBeInTheDocument();
  });
});
