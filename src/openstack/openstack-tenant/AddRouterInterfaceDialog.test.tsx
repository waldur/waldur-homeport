import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackPortsList,
  openstackRoutersAddRouterInterface,
  openstackSubnetsList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { AddRouterInterfaceDialog } from './AddRouterInterfaceDialog';

const mockRouter = {
  uuid: 'router-uuid',
  tenant_uuid: 'tenant-uuid',
  ports: [{ subnet_uuid: 'sub-existing' }],
};

const renderDialog = () => {
  return renderWithProviders(
    <AddRouterInterfaceDialog resolve={{ router: mockRouter as any }} />,
  );
};

describe('AddRouterInterfaceDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [{ url: '/subnet-1/', name: 'subnet-1', cidr: '10.0.0.0/24' }],
    } as any);

    vi.mocked(openstackPortsList).mockResolvedValue({
      data: [
        {
          url: '/port-1/',
          uuid: 'port-uuid',
          name: 'port-1',
          mac_address: '00:11:22:33:44:55',
          fixed_ips: [{ ip_address: '192.168.1.5' }],
        },
        {
          url: '/port-2/',
          uuid: 'port-no-name-uuid',
          mac_address: null,
          fixed_ips: [],
        },
      ],
    } as any);
    vi.mocked(openstackRoutersAddRouterInterface).mockResolvedValue({
      data: {},
    } as any);
  });

  it('renders subnets and ports successfully', async () => {
    renderDialog();

    expect(screen.getByText('Add router interface')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText('Select subnet')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Subnet')).toBeInTheDocument();
    expect(screen.getByLabelText('Port')).toBeInTheDocument();
  });

  it('submits correctly when adding subnet interface', async () => {
    const user = userEvent.setup();
    renderDialog();

    await waitFor(() => {
      expect(screen.getByLabelText('Select subnet')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Select subnet'));
    await user.click(screen.getByText('subnet-1 (10.0.0.0/24)'));

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(openstackRoutersAddRouterInterface).toHaveBeenCalledWith({
        path: { uuid: 'router-uuid' },
        body: { subnet: '/subnet-1/' },
      });
    });
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Router interface was added.',
    );
    expect(useModal().closeDialog).toHaveBeenCalled();
  });

  it('submits correctly when adding port interface', async () => {
    const user = userEvent.setup();
    renderDialog();

    await waitFor(() => {
      expect(screen.getByLabelText('Select subnet')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Port'));

    await waitFor(() => {
      expect(screen.getByLabelText('Select existing port')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Select existing port'));
    await user.click(
      screen.getByText('192.168.1.5 (00:11:22:33:44:55) / port-1'),
    );

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(openstackRoutersAddRouterInterface).toHaveBeenCalledWith({
        path: { uuid: 'router-uuid' },
        body: { port: '/port-1/' },
      });
    });
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Router interface was added.',
    );
    expect(useModal().closeDialog).toHaveBeenCalled();
  });

  it('handles API submission failure gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackRoutersAddRouterInterface).mockRejectedValue(
      new Error('API Error'),
    );
    renderDialog();

    await waitFor(() => {
      expect(screen.getByLabelText('Select subnet')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('Select subnet'));
    await user.click(screen.getByText('subnet-1 (10.0.0.0/24)'));

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        'Unable to add router interface.',
      );
    });
  });
});
