import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { vmwareVirtualMachineCreateDisk } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { CreateDiskDialog } from './CreateDiskDialog';

const resource = { uuid: 'vm-uuid', name: 'web-01' };

describe('CreateDiskDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vmwareVirtualMachineCreateDisk).mockResolvedValue({
      data: {},
    } as any);
  });

  it('asks for the size in GB and reports the disk as scheduled', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreateDiskDialog resolve={{ resource, refetch: vi.fn() }} />,
    );

    await user.type(await screen.findByRole('spinbutton'), '20');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(vmwareVirtualMachineCreateDisk).toHaveBeenCalledWith({
        path: { uuid: 'vm-uuid' },
        body: { size: 20 * 1024 },
      }),
    );
    // The disk is only scheduled at this point; vCenter can still refuse it,
    // in which case it turns Erred with the reason on the disk itself.
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Disk creation has been scheduled.',
    );
  });
});
