import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  personalAccessTokensTemplatesList,
  personalAccessTokensTemplateTargetsList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CreateAgentTokenMenuItem } from './CreateAgentTokenMenuItem';

const offering = {
  uuid: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
  name: 'HPC',
  customer_uuid: '0f1e2d3c4b5a69788796a5b4c3d2e1f0',
};

const offeringTarget = {
  type: 'offering',
  uuid: 'a1b2c3d4-e5f6-0718-293a-4b5c6d7e8f90',
  name: 'HPC',
  context: 'Org',
  features: [],
  staff_access: false,
  bindings: [
    { type: 'offering', uuid: 'a1b2c3d4-e5f6-0718-293a-4b5c6d7e8f90' },
  ],
};

const asUser = (role: string | null) =>
  vi.mocked(useUser).mockReturnValue({
    is_staff: false,
    permissions: role
      ? [
          {
            scope_type: 'customer',
            scope_uuid: offering.customer_uuid,
            role_name: role,
          },
        ]
      : [],
  } as any);

const mockTargets = (targets: any[]) =>
  vi
    .mocked(personalAccessTokensTemplateTargetsList)
    .mockResolvedValue({ data: targets } as any);

const button = () =>
  screen.queryByRole('menuitem', { name: /Create agent token/ });

describe('CreateAgentTokenMenuItem', () => {
  let roles;

  beforeEach(() => {
    vi.clearAllMocks();
    roles = ENV.roles;
    ENV.roles = [
      { name: 'CUSTOMER.OWNER', permissions: ['OFFERING.UPDATE'] },
      { name: 'PROJECT.MEMBER', permissions: [] },
    ] as any;
    asUser(null);
    vi.mocked(personalAccessTokensTemplatesList).mockResolvedValue({
      data: [{ key: 'site_agent' }],
    } as any);
  });

  afterEach(() => {
    ENV.roles = roles;
  });

  const render = () =>
    renderWithProviders(
      inActionsMenu(<CreateAgentTokenMenuItem offering={offering} />),
    );

  it('is enabled for a manager of this offering', async () => {
    mockTargets([offeringTarget]);
    render();
    await waitFor(() =>
      expect(button()).not.toHaveAttribute('aria-disabled', 'true'),
    );
    expect(personalAccessTokensTemplateTargetsList).toHaveBeenCalledWith({
      query: { template: 'site_agent', uuid: offering.uuid },
    });
  });

  it('is enabled for an owner of the service provider organization', async () => {
    // The backend lists the offering to the owners of its organization when
    // the organization is a service provider.
    asUser('CUSTOMER.OWNER');
    mockTargets([offeringTarget]);
    render();
    await waitFor(() => expect(button()).toBeInTheDocument());
    expect(button()).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('is hidden when the backend lists no target, as for an owner of an organization that is not a service provider', async () => {
    asUser('CUSTOMER.OWNER');
    mockTargets([]);
    render();
    await waitFor(() =>
      expect(personalAccessTokensTemplateTargetsList).toHaveBeenCalled(),
    );
    expect(button()).not.toBeInTheDocument();
  });

  it('is hidden when the site-agent template is not offered', async () => {
    vi.mocked(personalAccessTokensTemplatesList).mockResolvedValue({
      data: [],
    } as any);
    render();
    await waitFor(() =>
      expect(personalAccessTokensTemplatesList).toHaveBeenCalled(),
    );
    expect(personalAccessTokensTemplateTargetsList).not.toHaveBeenCalled();
    expect(button()).not.toBeInTheDocument();
  });
});
