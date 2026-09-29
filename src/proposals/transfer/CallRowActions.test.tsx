import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

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

  it('renders no menu when the user cannot update the call', () => {
    vi.mocked(canUpdateCall).mockReturnValue(false);
    renderWithProviders(<CallRowActions row={row} refetch={vi.fn()} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
