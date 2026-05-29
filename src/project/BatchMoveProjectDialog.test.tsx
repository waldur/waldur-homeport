import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersList, projectsMoveProject } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';

import { BatchMoveProjectDialog } from './BatchMoveProjectDialog';

describe('BatchMoveProjectDialog', () => {
  const mockRefetch = vi.fn();

  const rows = [
    { uuid: 'p1', name: 'Project 1' },
    { uuid: 'p2', name: 'Project 2' },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersList).mockResolvedValue({
      data: [{ name: 'Target Organization', url: 'org-url' }],
      response: {
        headers: {
          get: (name) => (name === 'x-result-count' ? '1' : null),
        },
      },
    } as any);
  });

  const renderDialog = () =>
    renderWithProviders(
      <BatchMoveProjectDialog resolve={{ rows, refetch: mockRefetch }} />,
    );

  it('renders selected projects', () => {
    renderDialog();
    expect(screen.getByText('Project 1')).toBeDefined();
    expect(screen.getByText('Project 2')).toBeDefined();
    expect(screen.getByText('Move 2 project(s) to organization')).toBeDefined();
  });

  it('performs batch move successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsMoveProject).mockResolvedValue({} as any);

    renderDialog();

    // Select organization
    await typeAndSelectOption(
      user,
      'Move to organization',
      'Target',
      'Target Organization',
    );

    // Submit
    await user.click(screen.getByRole('button', { name: 'Move' }));

    await waitFor(() => {
      expect(projectsMoveProject).toHaveBeenCalledTimes(2);
    });

    expect(projectsMoveProject).toHaveBeenCalledWith({
      path: { uuid: 'p1' },
      body: { customer: 'org-url', preserve_permissions: false },
    });

    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        '2 project(s) moved to Target Organization.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles partial success', async () => {
    const user = userEvent.setup();
    const error = new Error('Move failed');
    vi.mocked(projectsMoveProject)
      .mockResolvedValueOnce({} as any)
      .mockRejectedValueOnce(error);

    renderDialog();

    await typeAndSelectOption(
      user,
      'Move to organization',
      'Target',
      'Target Organization',
    );

    await user.click(screen.getByRole('button', { name: 'Move' }));

    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        '1 project(s) moved to Target Organization.',
      );
    });
    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        '1 project(s) could not be moved.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('respects preserve_permissions flag', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsMoveProject).mockResolvedValue({} as any);

    renderDialog();

    await typeAndSelectOption(
      user,
      'Move to organization',
      'Target',
      'Target Organization',
    );

    // Toggle checkbox
    await user.click(screen.getByLabelText('Preserve project permissions'));

    await user.click(screen.getByRole('button', { name: 'Move' }));

    await waitFor(() => {
      expect(projectsMoveProject).toHaveBeenCalledWith({
        path: { uuid: 'p1' },
        body: { customer: 'org-url', preserve_permissions: true },
      });
    });
  });
});
