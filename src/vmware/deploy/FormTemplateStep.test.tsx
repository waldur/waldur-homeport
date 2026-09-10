import { screen, waitFor, within } from '@testing-library/react';
import { Form } from 'react-final-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { vmwareLimitsRetrieve, vmwareTemplatesList } from 'waldur-js-client';

import { createTestQueryClient, renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { FormMemoryStep } from './FormMemoryStep';
import { FormProcessorStep } from './FormProcessorStep';
import { FormStorageStep } from './FormStorageStep';
import { FormTemplateStep } from './FormTemplateStep';

const template = {
  uuid: 'template-uuid',
  url: 'https://example.com/api/vmware-templates/template-uuid/',
  name: 'Ubuntu 22.04',
  cores: 4,
  cores_per_socket: 2,
  ram: 4096,
  disk: 20480,
  guest_os_name: 'Ubuntu Linux (64-bit)',
};

const offering = {
  uuid: 'offering-uuid',
  scope_uuid: 'scope-uuid',
  customer_uuid: 'customer-uuid',
} as any;

const renderSteps = () => {
  vi.mocked(vmwareTemplatesList).mockResolvedValue(
    mockListResponse([template]),
  );
  vi.mocked(vmwareLimitsRetrieve).mockResolvedValue({
    data: {
      max_cpu: 16,
      max_cores_per_socket: 8,
      max_ram: 65536,
      max_disk: 1048576,
      max_disk_total: 1048576,
    },
  } as any);

  // The templates are already cached, so the template step has them on its
  // very first render -- the load in which it writes the hardware in the same
  // commit that the hardware steps' fields mount in.
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(
    ['VMwareImages', offering.scope_uuid, offering.customer_uuid],
    [template],
  );

  return renderWithProviders(
    <Form onSubmit={vi.fn()} subscription={{ values: true }}>
      {() => (
        <>
          <FormTemplateStep id="step-template" offering={offering} />
          <FormProcessorStep id="step-processor" offering={offering} />
          <FormMemoryStep id="step-memory" offering={offering} />
          <FormStorageStep id="step-storage" offering={offering} />
        </>
      )}
    </Form>,
    { queryClient },
  );
};

describe('vSphere template step', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fills the hardware steps with the preselected template', async () => {
    renderSteps();

    await waitFor(() => {
      expect(screen.getByLabelText(/Number of cores in a VM/)).toHaveValue(4);
    });
    expect(screen.getByLabelText(/Number of CPU cores per socket/)).toHaveValue(
      2,
    );
    // The memory field carries a tooltip instead of a label, so it is reached
    // through its own card.
    expect(
      within(screen.getByTestId('step-memory')).getByRole('spinbutton'),
    ).toHaveValue(4);
    expect(
      within(screen.getByTestId('step-storage')).getByText('20'),
    ).toBeInTheDocument();
  });

  it('marks the preselected template as chosen', async () => {
    renderSteps();

    // The storage step renders the guest OS of the chosen template only, so
    // its presence is what tells the template apart from merely having had its
    // hardware copied.
    expect(
      await within(screen.getByTestId('step-storage')).findByText(
        'Ubuntu Linux (64-bit)',
      ),
    ).toBeInTheDocument();
    // The card's own radio drives its highlight. It carries `hidden`, so the
    // accessibility tree has to be asked for it explicitly.
    expect(
      within(screen.getByTestId('step-template')).getAllByRole('radio', {
        hidden: true,
        checked: true,
      }),
    ).not.toHaveLength(0);
  });
});
