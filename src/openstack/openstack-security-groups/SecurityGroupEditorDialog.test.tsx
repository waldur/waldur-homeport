import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackSecurityGroupsList,
  openstackSecurityGroupsSetRules,
} from 'waldur-js-client';

import { SecurityGroupEditorDialog } from './SecurityGroupEditorDialog';

vi.mock('waldur-js-client');

const fakeSecurityGroup = {
  url: '/api/openstack-security-groups/b40968a448034febbf04c195aafbb4e2/',
  uuid: 'b40968a448034febbf04c195aafbb4e2',
  name: 'http',
  rules: [
    {
      from_port: 80,
      to_port: 80,
      cidr: '192.168.42.0/24',
      protocol: 'tcp',
      ethertype: 'IPv4',
      direction: 'egress',
    },
  ],
  tenant: '/api/openstack-tenants/2bfc029827bb41e884ff60f4b8eff3b2/',
};

const renderDialog = (resource = fakeSecurityGroup) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SecurityGroupEditorDialog
        resolve={{ resource: resource as any, refetch: vi.fn() }}
      />
    </QueryClientProvider>,
  );
};

describe('SecurityGroupEditorDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openstackSecurityGroupsList).mockResolvedValue({
      data: [fakeSecurityGroup],
      headers: { 'x-result-count': '1' },
    } as any);
  });

  it('renders current security group rule name in modal dialog title', async () => {
    renderDialog();
    expect(
      await screen.findByText('Set rules in http security group'),
    ).toBeInTheDocument();
  });

  it('renders loading spinner while security groups are being loaded', async () => {
    vi.mocked(openstackSecurityGroupsList).mockReturnValue(
      new Promise(() => {}) as any,
    );
    renderDialog();
    expect(await screen.findByTestId('spinner')).toBeInTheDocument();
  });

  it('fills inputs with existing rule values', async () => {
    renderDialog();
    expect(
      await screen.findByText('Set rules in http security group'),
    ).toBeInTheDocument();
    await screen.findAllByRole('row');

    expect(screen.getByDisplayValue('IPv4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Egress')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TCP')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('80').length).toBe(1);
    expect(screen.getByDisplayValue('192.168.42.0/24')).toBeInTheDocument();
  });

  it('adds new row in table when Add rule button is clicked', async () => {
    const user = userEvent.setup();
    renderDialog();
    expect(
      await screen.findByText('Set rules in http security group'),
    ).toBeInTheDocument();
    const initialRows = (await screen.findAllByRole('row')).length;

    await user.click(screen.getByText('Add rule'));
    await waitFor(() =>
      expect(screen.getAllByRole('row').length).toBe(initialRows + 1),
    );
  });

  it('deletes existing row when Delete rule button is clicked', async () => {
    const user = userEvent.setup();
    renderDialog();
    expect(
      await screen.findByText('Set rules in http security group'),
    ).toBeInTheDocument();
    await screen.findAllByRole('row');

    await user.click(screen.getByRole('button', { name: /Remove/i }));
    expect(screen.queryAllByDisplayValue('80').length).toBe(0);
    expect(
      await screen.findByText('Security group does not contain any rule yet.'),
    ).toBeInTheDocument();
  });

  it('sends REST API request when form is being submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackSecurityGroupsSetRules).mockResolvedValue({} as any);
    renderDialog();
    expect(
      await screen.findByText('Set rules in http security group'),
    ).toBeInTheDocument();
    await screen.findAllByRole('row');

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(openstackSecurityGroupsSetRules).toHaveBeenCalledWith({
        path: { uuid: fakeSecurityGroup.uuid },
        body: [
          expect.objectContaining({
            cidr: '192.168.42.0/24',
            direction: 'egress',
            ethertype: 'IPv4',
            from_port: 80,
            protocol: 'tcp',
            to_port: 80,
          }),
        ],
      });
    });
  });

  it('correctly parses and submits port range', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackSecurityGroupsSetRules).mockResolvedValue({} as any);
    renderDialog();
    await screen.findAllByRole('row');

    const portInput = screen.getByDisplayValue('80');
    await user.clear(portInput);
    await user.type(portInput, '8000-9000');

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(openstackSecurityGroupsSetRules).toHaveBeenCalledWith(
        expect.objectContaining({
          body: [
            expect.objectContaining({
              from_port: 8000,
              to_port: 9000,
            }),
          ],
        }),
      );
    });
  });

  it('validates CIDR field', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findAllByRole('row');

    const cidrInput = screen.getByPlaceholderText('0.0.0.0/0');
    await user.clear(cidrInput);
    await user.type(cidrInput, 'invalid-cidr');

    // Blur to trigger touched
    await user.tab();

    await waitFor(() => {
      expect(cidrInput).toHaveClass('is-invalid');
      expect(cidrInput).toHaveAttribute(
        'title',
        'The value is not valid IP v4 CIDR',
      );
    });
  });

  it('validates CIDR according to the ethertype (IPv6)', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findAllByRole('row');

    const ethertypeSelect = screen.getByDisplayValue('IPv4');
    await user.selectOptions(ethertypeSelect, 'IPv6');

    const cidrInput = screen.getByPlaceholderText('::/0');
    await user.clear(cidrInput);
    await user.type(cidrInput, '10.0.0.1/24');
    await user.tab();

    await waitFor(() => {
      expect(cidrInput).toHaveClass('is-invalid');
      expect(cidrInput).toHaveAttribute(
        'title',
        'The value is not valid IP v6 CIDR',
      );
    });

    await user.clear(cidrInput);
    await user.type(cidrInput, '2002::1234:abcd:ffff:c0a8:101/64');
    await waitFor(() => {
      expect(cidrInput).not.toHaveClass('is-invalid');
    });
  });

  it('checks port max value for ICMP protocol', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findAllByRole('row');

    const protocolSelect = screen.getByDisplayValue('TCP');
    await user.selectOptions(protocolSelect, 'ICMP');

    const portInput = screen.getByDisplayValue('80');
    await user.clear(portInput);
    await user.type(portInput, '999');
    await user.tab();

    await waitFor(() => {
      expect(portInput).toHaveClass('is-invalid');
      expect(portInput).toHaveAttribute(
        'title',
        'Port number in the range should be at most 255.',
      );
    });
  });

  it('checks that minimum port number should not exceed the maximum port number', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findAllByRole('row');

    const portInput = screen.getByDisplayValue('80');
    await user.clear(portInput);
    await user.type(portInput, '80-50');
    await user.tab();

    await waitFor(() => {
      expect(portInput).toHaveClass('is-invalid');
      expect(portInput).toHaveAttribute(
        'title',
        'The minimum port number should not exceed the maximum port number.',
      );
    });
  });

  it('allows to select remote security group', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackSecurityGroupsSetRules).mockResolvedValue({} as any);
    renderDialog();
    await screen.findAllByRole('row');

    const remoteGroupSelect = screen.getByDisplayValue('None');
    await user.selectOptions(remoteGroupSelect, fakeSecurityGroup.url);

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(openstackSecurityGroupsSetRules).toHaveBeenCalledWith(
        expect.objectContaining({
          body: [
            expect.objectContaining({
              remote_group: fakeSecurityGroup.url,
            }),
          ],
        }),
      );
    });
  });

  it('allows to provide security group description', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackSecurityGroupsSetRules).mockResolvedValue({} as any);
    const { container } = renderDialog();
    await screen.findAllByRole('row');

    const descriptionInput = container.querySelector(
      'input[name="rules[0].description"]',
    ) as HTMLInputElement;
    await user.type(descriptionInput, 'test description');

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(openstackSecurityGroupsSetRules).toHaveBeenCalledWith(
        expect.objectContaining({
          body: [
            expect.objectContaining({
              description: 'test description',
            }),
          ],
        }),
      );
    });
  });
});
