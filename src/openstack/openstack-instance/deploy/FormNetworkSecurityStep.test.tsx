import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackFloatingIpsList,
  openstackSubnetsList,
} from 'waldur-js-client';

import { mockListResponse } from '@/test/utils';

import { FormNetworkSecurityStep } from './FormNetworkSecurityStep';

vi.mock('./utils', () => ({
  useQuotasData: () => ({ fipQuota: undefined }),
}));

vi.mock('./FormSSHPublicKeysField', () => ({
  FormSSHPublicKeysField: () => null,
}));

vi.mock('./FormSecurityGroupsField', () => ({
  FormSecurityGroupsField: () => null,
}));

const SUBNET = {
  url: 'https://example.com/api/openstack-subnets/abc/',
  uuid: 'abc',
  name: 'subnet-a',
  cidr: '10.0.0.0/24',
};

const SUBNET_B = {
  url: 'https://example.com/api/openstack-subnets/def/',
  uuid: 'def',
  name: 'subnet-b',
  cidr: '10.0.1.0/24',
};

const offering = { scope_uuid: 'tenant-1', quotas: [] } as any;

const renderStep = (initialValues: any = {}) => {
  let latestValues: any;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <Form
        onSubmit={vi.fn()}
        mutators={{ ...arrayMutators }}
        initialValues={initialValues}
        subscription={{ values: true }}
        render={({ values, handleSubmit }) => {
          latestValues = values;
          return (
            <form onSubmit={handleSubmit}>
              <FormNetworkSecurityStep
                id="step-network-security"
                offering={offering}
              />
            </form>
          );
        }}
      />
    </QueryClientProvider>,
  );
  return {
    ...result,
    getValues: () => latestValues,
  };
};

describe('FormNetworkSecurityStep — auto-seed first network row', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openstackFloatingIpsList).mockResolvedValue(mockListResponse([]));
  });

  afterEach(() => cleanup());

  it('seeds exactly one network row with the first available subnet', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockListResponse([SUBNET, SUBNET_B]),
    );

    const { getValues } = renderStep();

    await waitFor(() => {
      const networks = getValues()?.attributes?.networks;
      expect(networks).toHaveLength(1);
      expect(networks[0].subnet.uuid).toBe(SUBNET.uuid);
    });

    expect(screen.getByText(SUBNET.name)).toBeInTheDocument();
  });

  it('does not seed when the tenant has no subnets', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue(mockListResponse([]));

    const { getValues } = renderStep();

    await waitFor(() => {
      expect(openstackSubnetsList).toHaveBeenCalled();
    });

    expect(getValues()?.attributes?.networks).toBeUndefined();
  });

  it('does not overwrite networks that are already populated', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockListResponse([SUBNET, SUBNET_B]),
    );

    const existing = [{ subnet: SUBNET_B, floatingIp: { url: 'false' } }];
    const { getValues } = renderStep({ attributes: { networks: existing } });

    // Once subnet data has loaded, the seed effect runs and must early-return
    // because existing networks are present. The form value stays as-is.
    await waitFor(() => {
      expect(openstackSubnetsList).toHaveBeenCalled();
    });

    const networks = getValues()?.attributes?.networks;
    expect(networks).toHaveLength(1);
    expect(networks[0].subnet.uuid).toBe(SUBNET_B.uuid);
  });

  it('does not add a duplicate row when "Add subnet" is clicked while every subnet is in use', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockListResponse([SUBNET]),
    );

    const { getValues } = renderStep();

    await waitFor(() => {
      expect(getValues()?.attributes?.networks).toHaveLength(1);
    });

    const addButton = screen.getByRole('button', { name: /add subnet/i });
    expect(addButton).toBeDisabled();

    // Even if a stale click landed, the form state should still be 1 row.
    await userEvent.click(addButton).catch(() => undefined);
    expect(getValues()?.attributes?.networks).toHaveLength(1);
  });
});
