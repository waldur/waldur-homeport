import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import { waitForConfirmation } from '@/modal/actions';
import { showSuccess, showErrorResponse } from '@/store/notify';

import { DeleteButton } from './DeleteButton';

vi.mock('@/modal/actions', () => ({
  waitForConfirmation: vi.fn(),
}));

vi.mock('@/store/notify', () => ({
  showSuccess: vi.fn(() => ({ type: 'SHOW_SUCCESS' })),
  showErrorResponse: vi.fn(() => ({ type: 'SHOW_ERROR' })),
}));

vi.mock('@/i18n', () => ({
  translate: (str: string) => str,
}));

vi.mock('@/marketplace/resources/actions/ResourceActionMenuContext', () => ({
  ResourceActionMenuContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

interface MockRow {
  uuid: string;
  name: string;
}

const mockStore = createStore(() => ({}));

const renderDeleteButton = (props = {}) => {
  const defaultProps = {
    row: { uuid: 'test-uuid', name: 'Test Item' } as MockRow,
    apiFunction: vi.fn().mockResolvedValue(undefined),
    confirmMessage: 'Are you sure?',
    refetch: vi.fn(),
  };

  return render(
    <Provider store={mockStore}>
      <DeleteButton {...defaultProps} {...props} />
    </Provider>,
  );
};

describe('DeleteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders action item with default title', () => {
    renderDeleteButton();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    renderDeleteButton({ title: 'Remove' });
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('shows confirmation dialog and calls API on confirm', async () => {
    const apiFunction = vi.fn().mockResolvedValue(undefined);
    const refetch = vi.fn();
    (waitForConfirmation as Mock).mockResolvedValue(undefined);

    renderDeleteButton({ apiFunction, refetch });

    await act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(waitForConfirmation).toHaveBeenCalledWith(
        expect.any(Function),
        'Confirmation',
        'Are you sure?',
        { forDeletion: true },
      );
    });

    await waitFor(() => {
      expect(apiFunction).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('does not call API when user cancels confirmation', async () => {
    const apiFunction = vi.fn();
    (waitForConfirmation as Mock).mockRejectedValue(new Error('Cancelled'));

    renderDeleteButton({ apiFunction });

    await act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(waitForConfirmation).toHaveBeenCalled();
      expect(apiFunction).not.toHaveBeenCalled();
    });
  });

  it('shows error notification on API failure', async () => {
    const error = new Error('Delete failed');
    const apiFunction = vi.fn().mockRejectedValue(error);
    (waitForConfirmation as Mock).mockResolvedValue(undefined);

    renderDeleteButton({ apiFunction });

    await act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to delete item.',
      );
    });
  });

  it('uses custom success and error messages', async () => {
    const apiFunction = vi.fn().mockResolvedValue(undefined);
    (waitForConfirmation as Mock).mockResolvedValue(undefined);

    renderDeleteButton({
      apiFunction,
      successMessage: 'Item deleted successfully!',
      errorMessage: 'Failed to delete item.',
    });

    await act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(showSuccess).toHaveBeenCalledWith('Item deleted successfully!');
    });
  });

  it('skips confirmation when skipConfirmation is true', async () => {
    const apiFunction = vi.fn().mockResolvedValue(undefined);
    const refetch = vi.fn();

    renderDeleteButton({
      apiFunction,
      refetch,
      skipConfirmation: true,
    });

    await act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(waitForConfirmation).not.toHaveBeenCalled();
      expect(apiFunction).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('calls message functions with row when they are functions', async () => {
    const row = { uuid: 'test-uuid', name: 'Test Item' };
    const confirmMessage = vi.fn((r: MockRow) => `Delete ${r.name}?`);
    const successMessage = vi.fn((r: MockRow) => `${r.name} deleted!`);
    (waitForConfirmation as Mock).mockResolvedValue(undefined);

    renderDeleteButton({
      row,
      confirmMessage,
      successMessage,
      apiFunction: vi.fn().mockResolvedValue(undefined),
    });

    await act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(waitForConfirmation).toHaveBeenCalledWith(
        expect.any(Function),
        'Confirmation',
        'Delete Test Item?',
        { forDeletion: true },
      );
      expect(showSuccess).toHaveBeenCalledWith('Test Item deleted!');
    });
  });

  it('renders as button when renderAs is button', () => {
    renderDeleteButton({ renderAs: 'button' });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-danger');
  });

  it('renders disabled when disabled prop is true', () => {
    renderDeleteButton({ renderAs: 'button', disabled: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onSuccess callback after successful deletion', async () => {
    const onSuccess = vi.fn();
    const apiFunction = vi.fn().mockResolvedValue(undefined);
    (waitForConfirmation as Mock).mockResolvedValue(undefined);

    renderDeleteButton({
      apiFunction,
      onSuccess,
    });

    await act(() => {
      fireEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
