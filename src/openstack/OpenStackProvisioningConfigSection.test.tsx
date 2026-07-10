import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { OpenStackProvisioningConfigSection } from './OpenStackProvisioningConfigSection';

// Mock hook
const mockUpdate = vi.fn().mockResolvedValue(null);
vi.mock('@/marketplace/offerings/update/integration/utils', () => ({
  useUpdateOfferingIntegration: () => ({
    update: mockUpdate,
  }),
}));

describe('OpenStackProvisioningConfigSection', () => {
  const mockOffering = {
    uuid: 'offering-uuid',
    name: 'OpenStack Offering',
    type: 'OpenStack',
    plugin_options: {
      storage_mode: 'dynamic',
    },
    secret_options: {
      ipv4_external_ip_mapping: [
        { floating_ip: '1.2.3.4', external_ip: '192.168.1.1' },
      ],
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders provisioning config, navigates to IP mapping tab and opens edit modal', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <OpenStackProvisioningConfigSection
        offering={mockOffering}
        refetch={vi.fn()}
      />,
    );

    // Verify Title
    expect(screen.getByText('Provisioning configuration')).toBeInTheDocument();

    // Navigate to IP mapping tab
    const ipMappingTab = screen.getByRole('tab', { name: /IP mapping/i });
    await user.click(ipMappingTab);

    // Verify current mapping values render in readout
    expect(screen.getByText('1.2.3.4: 192.168.1.1')).toBeInTheDocument();

    // Click edit button
    const editBtn = screen.getByTestId(
      'edit-secret_options.ipv4_external_ip_mapping',
    );
    expect(editBtn).toBeInTheDocument();
    await user.click(editBtn);

    // Verify useModal().openDialog was called
    const openDialogMock = vi.mocked(useModal().openDialog);
    expect(openDialogMock).toHaveBeenCalled();

    // Retrieve dialog component and props
    const [dialogComponent, dialogProps] = openDialogMock.mock.calls[0] as any;

    // Render the dialog component to test the integration of the dialog with our field array mutators
    renderWithProviders(React.createElement(dialogComponent, dialogProps));

    // Verify initial values render in the dialog input fields (awaiting lazy load)
    expect(await screen.findByDisplayValue('1.2.3.4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('192.168.1.1')).toBeInTheDocument();

    // Click "Add" button to add a new row
    const addButton = screen.getByRole('button', { name: /Add/i });
    await user.click(addButton);

    // Verify a new row is added (2 initial inputs + 2 new inputs = 4 inputs total)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);

    // Type values into the new row inputs (the added fields are at index 2 and 3)
    await user.type(inputs[2], '5.6.7.8');
    await user.type(inputs[3], '192.168.1.2');

    // Click confirm button to submit
    const submitBtn = screen.getByRole('button', { name: /Confirm/i });
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    // Verify update callback was invoked with updated mapping values
    expect(mockUpdate).toHaveBeenCalledWith({
      secret_options: {
        ipv4_external_ip_mapping: [
          { floating_ip: '1.2.3.4', external_ip: '192.168.1.1' },
          { floating_ip: '5.6.7.8', external_ip: '192.168.1.2' },
        ],
      },
    });

    // Verify dialog was closed
    await waitFor(() => {
      expect(useModal().closeDialog).toHaveBeenCalled();
    });
  });
});
