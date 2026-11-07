import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { canUpdateCall } from '../utils';

import { CallRowActions } from './CallRowActions';

vi.mock('../utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils')>()),
  canUpdateCall: vi.fn(),
}));
const row: any = {
  uuid: 'call-uuid',
  name: 'Spring call',
  manager_uuid: 'manager-uuid',
};

describe('CallRowActions', () => {
  const openDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({ openDialog } as any);
  });

  it('opens the export dialog for the row', async () => {
    vi.mocked(canUpdateCall).mockReturnValue(true);
    const user = userEvent.setup();
    renderWithProviders(<CallRowActions row={row} refetch={vi.fn()} />);

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Export'));

    expect(openDialog).toHaveBeenCalledWith(expect.anything(), {
      resolve: { call: row },
    });
  });

  it('offers staff to save the call as a template', async () => {
    vi.mocked(canUpdateCall).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    const user = userEvent.setup();
    renderWithProviders(<CallRowActions row={row} refetch={vi.fn()} />);

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Save as template'));

    expect(openDialog).toHaveBeenCalledWith(expect.anything(), {
      resolve: { call: row },
    });
  });

  it('does not offer a call manager to save the call as a template', async () => {
    vi.mocked(canUpdateCall).mockReturnValue(true);
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    const user = userEvent.setup();
    renderWithProviders(<CallRowActions row={row} refetch={vi.fn()} />);

    await user.click(screen.getByRole('button'));
    expect(await screen.findByText('Export')).toBeInTheDocument();
    expect(screen.queryByText('Save as template')).not.toBeInTheDocument();
  });

  it('opens the proposals, reviews and validation of an active call', async () => {
    vi.mocked(canUpdateCall).mockReturnValue(true);
    const user = userEvent.setup();
    renderWithProviders(
      <CallRowActions row={{ ...row, state: 'active' }} refetch={vi.fn()} />,
    );

    await user.click(screen.getByRole('button'));
    for (const name of ['Proposals', 'Reviews', 'Validation']) {
      expect(await screen.findByText(name)).toBeInTheDocument();
    }
  });

  it('offers no workflow pages for a draft call', async () => {
    vi.mocked(canUpdateCall).mockReturnValue(true);
    const user = userEvent.setup();
    renderWithProviders(
      <CallRowActions row={{ ...row, state: 'draft' }} refetch={vi.fn()} />,
    );

    await user.click(screen.getByRole('button'));
    expect(await screen.findByText('Export')).toBeInTheDocument();
    expect(screen.queryByText('Proposals')).not.toBeInTheDocument();
    expect(screen.queryByText('Validation')).not.toBeInTheDocument();
  });

  it('renders no menu when the user cannot update the call', () => {
    vi.mocked(canUpdateCall).mockReturnValue(false);
    renderWithProviders(<CallRowActions row={row} refetch={vi.fn()} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
