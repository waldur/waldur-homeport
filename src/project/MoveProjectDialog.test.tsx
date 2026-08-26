import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersList, projectsMoveProject } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { MoveProjectDialog } from './MoveProjectDialog';

describe('MoveProjectDialog', () => {
  const mockRefetch = vi.fn();
  const project = { uuid: 'p1', name: 'Test Project' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersList).mockResolvedValue(
      mockListResponse([
        { name: 'Target Organization', url: 'org-url', abbreviation: 'TO' },
      ]),
    );
  });

  const renderDialog = () =>
    renderWithProviders(
      <MoveProjectDialog resolve={{ project, refetch: mockRefetch }} />,
    );

  it('renders correctly', () => {
    renderDialog();
    expect(screen.getByText('Move project')).toBeDefined();
    expect(screen.getByText(/Test Project/)).toBeDefined();
    expect(screen.getByText('Move to organization')).toBeDefined();
    expect(screen.getByLabelText('Preserve project permissions')).toBeDefined();
  });

  it('performs move successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsMoveProject).mockResolvedValue({} as any);

    renderDialog();

    // Select organization
    await typeAndSelectOption(
      user,
      'Move to organization',
      'Target',
      'Target Organization (TO)',
    );

    // Submit
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(projectsMoveProject).toHaveBeenCalledWith({
        path: { uuid: 'p1' },
        body: { customer: 'org-url', preserve_permissions: false },
      });
    });

    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Test Project project has been moved to Target Organization organization.',
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
      'Target Organization (TO)',
    );

    // Toggle checkbox
    await user.click(screen.getByLabelText('Preserve project permissions'));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(projectsMoveProject).toHaveBeenCalledWith({
        path: { uuid: 'p1' },
        body: { customer: 'org-url', preserve_permissions: true },
      });
    });
  });

  it('handles error during move', async () => {
    const user = userEvent.setup();
    const error = { response: { data: 'Move failed' } };
    vi.mocked(projectsMoveProject).mockRejectedValue(error);

    renderDialog();

    await typeAndSelectOption(
      user,
      'Move to organization',
      'Target',
      'Target Organization (TO)',
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(useNotify().showError).toHaveBeenCalledWith(
        expect.stringContaining('Project could not be moved.'),
      );
    });
  });
});
