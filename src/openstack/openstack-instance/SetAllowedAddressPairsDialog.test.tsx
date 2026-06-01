import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OpenStackInstance,
  openstackPortsSetAllowedAddressPairs,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { SetAllowedAddressPairsDialog } from './SetAllowedAddressPairsDialog';

// Mock dependencies
vi.mock('./utils', () => ({
  formatAddressList: () => '192.168.1.100',
}));

const mockInstance = {
  uuid: 'instance-uuid',
  name: 'test-instance',
} as OpenStackInstance;

const mockPort = {
  uuid: 'port-uuid',
  allowed_address_pairs: [
    { ip_address: '10.0.0.1/32', mac_address: 'fa:16:3e:00:00:01' },
  ],
};

describe('SetAllowedAddressPairsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial pairs', () => {
    renderWithProviders(
      <SetAllowedAddressPairsDialog
        resolve={{ instance: mockInstance, port: mockPort as any }}
      />,
    );

    expect(
      screen.getByText(
        'Set allowed address pairs (test-instance / 192.168.1.100)',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10.0.0.1/32')).toBeInTheDocument();
    expect(screen.getByDisplayValue('fa:16:3e:00:00:01')).toBeInTheDocument();
  });

  it('submits the form with modified pairs', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <SetAllowedAddressPairsDialog
        resolve={{ instance: mockInstance, port: mockPort as any }}
      />,
    );

    // Add a new pair
    const addButton = screen.getByRole('button', {
      name: 'Add pair',
    });
    await user.click(addButton);

    // Fill the new pair fields
    const inputs = screen.getAllByRole('textbox');
    // inputs[0], inputs[1] are existing pair. inputs[2], inputs[3] are new pair.
    await user.type(inputs[2], '192.168.2.0/24');
    await user.type(inputs[3], 'fa:16:3e:00:00:02');

    // Submit
    const submitButton = screen.getByText('Update');
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackPortsSetAllowedAddressPairs).toHaveBeenCalledTimes(1);
    });

    expect(openstackPortsSetAllowedAddressPairs).toHaveBeenCalledWith({
      path: { uuid: 'port-uuid' },
      body: {
        allowed_address_pairs: [
          { ip_address: '10.0.0.1/32', mac_address: 'fa:16:3e:00:00:01' },
          { ip_address: '192.168.2.0/24', mac_address: 'fa:16:3e:00:00:02' },
        ],
      },
    });
  });
});
