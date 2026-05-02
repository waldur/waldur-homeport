import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsMoveProject } from 'waldur-js-client';

import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/notify';

import { BatchMoveProjectDialog } from './BatchMoveProjectDialog';

vi.mock('waldur-js-client');
vi.mock('@/store/notify');
vi.mock('@/modal/hooks');
vi.mock('@/modal/CloseDialogButton', () => ({
  CloseDialogButton: () => <button>Close</button>,
}));
vi.mock('@/i18n', () => ({
  translate: (key, context) => {
    if (context) {
      return Object.entries(context).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
        key,
      );
    }
    return key;
  },
}));

vi.mock('@/form/AsyncSelectField', () => ({
  Select: ({ input }) => (
    <input
      data-testid="organization-select"
      onChange={(e) =>
        input.onChange({ url: e.target.value, name: 'Target Organization' })
      }
    />
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('BatchMoveProjectDialog', () => {
  const mockRefetch = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockCloseDialog = vi.fn();
  const mockConfirm = vi.fn();

  const rows = [
    { uuid: 'p1', name: 'Project 1' },
    { uuid: 'p2', name: 'Project 2' },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
      confirm: mockConfirm,
    } as any);
  });

  const renderDialog = () =>
    render(
      <BatchMoveProjectDialog resolve={{ rows, refetch: mockRefetch }} />,
      { wrapper: createWrapper() },
    );

  it('renders selected projects', () => {
    renderDialog();
    expect(screen.getByText('Project 1')).toBeDefined();
    expect(screen.getByText('Project 2')).toBeDefined();
    expect(screen.getByText('Move 2 project(s) to organization')).toBeDefined();
  });

  it('performs batch move successfully', async () => {
    vi.mocked(projectsMoveProject).mockResolvedValue({} as any);

    renderDialog();

    // Select organization
    fireEvent.change(screen.getByTestId('organization-select'), {
      target: { value: 'org-url' },
    });

    // Submit
    fireEvent.click(screen.getByText('Move'));

    await waitFor(() => {
      expect(projectsMoveProject).toHaveBeenCalledTimes(2);
    });

    expect(projectsMoveProject).toHaveBeenCalledWith({
      path: { uuid: 'p1' },
      body: { customer: 'org-url', preserve_permissions: false },
    });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        '2 project(s) moved to Target Organization.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles partial success', async () => {
    const error = new Error('Move failed');
    vi.mocked(projectsMoveProject)
      .mockResolvedValueOnce({} as any)
      .mockRejectedValueOnce(error);

    renderDialog();

    fireEvent.change(screen.getByTestId('organization-select'), {
      target: { value: 'org-url' },
    });

    fireEvent.click(screen.getByText('Move'));

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        '1 project(s) moved to Target Organization.',
      );
    });
    await waitFor(() => {
      expect(mockShowErrorResponse).toHaveBeenCalledWith(
        error,
        '1 project(s) could not be moved.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('respects preserve_permissions flag', async () => {
    vi.mocked(projectsMoveProject).mockResolvedValue({} as any);

    renderDialog();

    fireEvent.change(screen.getByTestId('organization-select'), {
      target: { value: 'org-url' },
    });

    // Toggle checkbox
    fireEvent.click(screen.getByLabelText('Preserve project permissions'));

    fireEvent.click(screen.getByText('Move'));

    await waitFor(() => {
      expect(projectsMoveProject).toHaveBeenCalledWith({
        path: { uuid: 'p1' },
        body: { customer: 'org-url', preserve_permissions: true },
      });
    });
  });
});
