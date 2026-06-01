import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCategoryColumnsCreate,
  marketplaceCategoryColumnsDestroy,
  marketplaceCategoryColumnsList,
} from 'waldur-js-client';

import { Category } from '@/marketplace/types';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { CategoryManageColumnsDialog } from './CategoryManageColumnsDialog';

const category = {
  uuid: 'category-uuid',
  title: 'Test Category',
  columns: [],
} as Category;

describe('CategoryManageColumnsDialog', () => {
  const renderDialog = () => {
    return renderWithProviders(
      <CategoryManageColumnsDialog resolve={{ category }} />,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with title and form', async () => {
    vi.mocked(marketplaceCategoryColumnsList).mockResolvedValue(
      mockListResponse([]),
    );

    renderDialog();
    await screen.findByText('Set columns in Test Category category');
    expect(
      screen.getByText(
        `Category ${category.title} does not contain a column yet.`,
      ),
    ).toBeInTheDocument();
  });

  it('allows adding a new column', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceCategoryColumnsList).mockResolvedValue(
      mockListResponse([]),
    );

    renderDialog();
    await screen.findByText('Set columns in Test Category category');

    const addButton = screen.getByRole('button', { name: /Add column/i });
    await user.click(addButton);

    // After clicking add button, the form should show column fields
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Attribute')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('Index')).toBeInTheDocument();

    // Fill in form fields using semantic labels
    await user.type(screen.getByLabelText('Title'), 'Test Column');
    await user.type(screen.getByLabelText('Attribute'), 'test_attribute');
    await user.type(screen.getByLabelText('Index'), '1');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(marketplaceCategoryColumnsCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          title: 'Test Column',
          attribute: 'test_attribute',
          index: '1',
        }),
      });
    });
  });

  it('allows removing an existing column', async () => {
    const user = userEvent.setup();
    const existingColumn = {
      uuid: 'col1-uuid',
      title: 'Existing Column',
      attribute: 'existing_attr',
      index: 1,
    };

    vi.mocked(marketplaceCategoryColumnsList).mockResolvedValue(
      mockListResponse([existingColumn]),
    );

    renderDialog();
    await screen.findByText('Set columns in Test Category category');

    // Verify existing column is displayed
    expect(screen.getByDisplayValue('Existing Column')).toBeInTheDocument();

    // Click delete button for the column
    const deleteButton = screen.getByRole('button', { name: /Remove/i });
    await user.click(deleteButton);

    // Verify API call
    await waitFor(() => {
      expect(marketplaceCategoryColumnsDestroy).toHaveBeenCalledWith({
        path: { uuid: existingColumn.uuid },
      });
    });
  });
});
