import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceCategoryColumnsCreate,
  marketplaceCategoryColumnsDestroy,
  marketplaceCategoryColumnsList,
} from 'waldur-js-client';

import { Category } from '@/marketplace/types';
import { useNotify } from '@/store/notify';

import { CategoryManageColumnsDialog } from './CategoryManageColumnsDialog';

const category = {
  uuid: 'category-uuid',
  title: 'Test Category',
  columns: [],
} as Category;

const mockConfirm = vi.fn();

vi.mock('waldur-js-client');
vi.mock('@/store/notify');

describe('CategoryManageColumnsDialog', () => {
  const renderDialog = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <CategoryManageColumnsDialog resolve={{ category }} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNotify).mockReturnValue({
      showError: vi.fn(),
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    } as any);
  });

  it('renders dialog with title and form', async () => {
    vi.mocked(marketplaceCategoryColumnsList).mockResolvedValue({
      data: [],
    } as any);

    renderDialog();
    await screen.findByText('Set columns in Test Category category');
    expect(
      screen.getByText(
        `Category ${category.title} does not contain a column yet.`,
      ),
    ).toBeInTheDocument();
  });

  it('allows adding a new column', async () => {
    vi.mocked(marketplaceCategoryColumnsList).mockResolvedValue({
      data: [],
    } as any);

    renderDialog();
    await screen.findByText('Set columns in Test Category category');

    const addButton = screen.getByText('Add column');
    fireEvent.click(addButton);

    // After clicking add button, the form should show column fields
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Attribute')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('Index')).toBeInTheDocument();

    const user = userEvent.setup();

    // Fill in form fields
    await user.type(screen.getAllByRole('textbox')[0], 'Test Column');
    await user.type(screen.getAllByRole('textbox')[1], 'test_attribute');
    await user.type(screen.getAllByRole('textbox')[2], '1');

    // Submit form
    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    // Verify API call
    expect(marketplaceCategoryColumnsCreate).toHaveBeenCalledWith({
      body: {
        title: 'Test Column',
        attribute: 'test_attribute',
        index: '1',
      },
    });
  });

  it('allows removing an existing column', async () => {
    const existingColumn = {
      uuid: 'col1-uuid',
      title: 'Existing Column',
      attribute: 'existing_attr',
      index: 1,
    };

    vi.mocked(marketplaceCategoryColumnsList).mockResolvedValue({
      data: [existingColumn],
    } as any);

    // Mock confirmation dialog to resolve (accept)
    mockConfirm.mockResolvedValue(undefined);

    const { container } = renderDialog();
    await screen.findByText('Set columns in Test Category category');

    // Verify existing column is displayed
    expect(screen.getByDisplayValue('Existing Column')).toBeInTheDocument();

    // Click delete button for the column (icon-only button with danger variant)
    const deleteButton = container.querySelector('button.btn-danger');
    await userEvent.click(deleteButton);

    // Verify API call
    expect(marketplaceCategoryColumnsDestroy).toHaveBeenCalledWith({
      path: { uuid: existingColumn.uuid },
    });
  });
});
