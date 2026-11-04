import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hpcWorkspacesFileContentRetrieve,
  hpcWorkspacesOutputSeriesRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { HpcFileContentDialog, HpcFileTab } from './HpcFileContentDialog';

const open = (path: string, tab?: HpcFileTab) =>
  renderWithProviders(
    <HpcFileContentDialog resolve={{ resourceUuid: 'r-1', path, tab }} />,
  );

describe('HpcFileContentDialog', () => {
  beforeEach(() => {
    vi.mocked(hpcWorkspacesFileContentRetrieve)
      .mockReset()
      .mockResolvedValue({ data: { content: '0 1.5\n' } } as any);
    // No chart: the plot pane stays empty, which is all these tests need.
    vi.mocked(hpcWorkspacesOutputSeriesRetrieve)
      .mockReset()
      .mockResolvedValue({ data: null } as any);
  });

  it('opened on the plot leaves the file until its content is shown', async () => {
    open('/scratch/alice/energy.xvg', 'plot');
    await waitFor(() =>
      expect(hpcWorkspacesOutputSeriesRetrieve).toHaveBeenCalled(),
    );
    expect(hpcWorkspacesFileContentRetrieve).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('tab', { name: 'Content' }));
    expect(await screen.findByText(/0 1\.5/)).toBeInTheDocument();
    expect(hpcWorkspacesFileContentRetrieve).toHaveBeenCalledTimes(1);
  });

  it('offers a plot of a WRF log opened by its path', async () => {
    open('/scratch/alice/run/rsl.out.0000');
    expect(screen.getByRole('tab', { name: 'Plot' })).toBeInTheDocument();
    expect(await screen.findByText(/0 1\.5/)).toBeInTheDocument();
  });
});
