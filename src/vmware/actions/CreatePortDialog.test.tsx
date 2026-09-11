import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  vmwareNetworksList,
  vmwareVirtualMachineCreatePort,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { CreatePortDialog } from './CreatePortDialog';

const resource = {
  uuid: 'vm-uuid',
  name: 'web-01',
  customer_uuid: 'customer-uuid',
  settings_uuid: 'settings-uuid',
};

describe('CreatePortDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vmwareNetworksList).mockResolvedValue(
      mockListResponse([
        {
          name: 'DC0_DVPG0',
          url: 'https://example.com/api/vmware-networks/n1/',
        },
      ]),
    );
    vi.mocked(vmwareVirtualMachineCreatePort).mockResolvedValue({
      data: {},
    } as any);
  });

  it('sends the selected network with the request', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CreatePortDialog resolve={{ resource, refetch: vi.fn() }} />,
    );

    await user.type(await screen.findByLabelText(/Name/), 'backend-nic');
    await openAndSelectOption(user, 'Network', 'DC0_DVPG0');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(vmwareVirtualMachineCreatePort).toHaveBeenCalledWith({
        path: { uuid: 'vm-uuid' },
        body: {
          description: 'backend-nic',
          network: 'https://example.com/api/vmware-networks/n1/',
        },
      }),
    );
    // The adapter is only scheduled at this point; vCenter can still refuse it.
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Network adapter creation has been scheduled.',
    );
  });

  it('only offers networks paired with the organization', async () => {
    renderWithProviders(
      <CreatePortDialog resolve={{ resource, refetch: vi.fn() }} />,
    );

    await waitFor(() =>
      expect(vmwareNetworksList).toHaveBeenCalledWith({
        query: expect.objectContaining({
          customer_pair_uuid: 'customer-uuid',
          settings_uuid: 'settings-uuid',
        }),
      }),
    );
  });
});
