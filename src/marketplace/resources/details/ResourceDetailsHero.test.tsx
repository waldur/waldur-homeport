import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ResourceDetailsHero } from './ResourceDetailsHero';

const offering = {
  uuid: 'offering-uuid',
  name: 'Offering',
  state: 'Active',
  components: [],
  plans: [],
  plugin_options: {},
};

const baseResource = {
  uuid: 'resource-uuid',
  name: 'Resource',
  state: 'OK',
  backend_id: 'backend-id',
  offering_type: 'Marketplace.Slurm',
  offering_uuid: 'offering-uuid',
  provider_uuid: 'provider-uuid',
  customer_uuid: 'consumer-uuid',
  project_uuid: 'project-uuid',
  is_usage_based: true,
  limits: {},
  current_usages: {},
};

// Every consumer endpoint keyed by the resource; none may be used here.
const consumerCalls = () =>
  Object.entries(sdk)
    .filter(
      ([name, fn]) =>
        name.startsWith('marketplaceResources') &&
        vi.isMockFunction(fn) &&
        fn.mock.calls.length > 0,
    )
    .map(([name]) => name);

const renderHero = (resource) =>
  renderWithProviders(
    <ResourceDetailsHero
      resource={resource as any}
      scope={undefined}
      offering={offering as any}
      components={[]}
      refetch={vi.fn()}
      isLoading={false}
      providerView
    />,
  );

const openActions = async (user) => {
  await user.click(screen.getByRole('button', { name: /actions/i }));
};

describe('ResourceDetailsHero in the provider workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-uuid',
      is_staff: true,
      permissions: [],
    } as any);
    vi.mocked(sdk.marketplaceProviderResourcesPull).mockResolvedValue(
      {} as any,
    );
    vi.mocked(sdk.marketplaceProviderResourcesRestore).mockResolvedValue(
      {} as any,
    );
  });

  it('pulls the resource through the provider endpoint', async () => {
    const user = userEvent.setup();
    renderHero(baseResource);
    await openActions(user);

    await user.click(await screen.findByText('Pull'));

    await waitFor(() =>
      expect(sdk.marketplaceProviderResourcesPull).toHaveBeenCalledWith({
        path: { uuid: 'resource-uuid' },
      }),
    );
    expect(consumerCalls()).toEqual([]);
  });

  it('hands the provider view to the usage dialog', async () => {
    const user = userEvent.setup();
    renderHero(baseResource);
    await openActions(user);

    await user.click(await screen.findByText('Show usage'));

    const { openDialog } = vi.mocked(useModal)();
    expect(openDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resolve: expect.objectContaining({ providerView: true }),
      }),
    );
    expect(consumerCalls()).toEqual([]);
  });

  it('restores the resource through the provider endpoint', async () => {
    const user = userEvent.setup();
    renderHero({
      ...baseResource,
      state: 'Terminated',
      offering_plugin_options: { can_restore_resource: true },
    });
    await openActions(user);

    await user.click(await screen.findByText('Restore resource'));

    await waitFor(() =>
      expect(sdk.marketplaceProviderResourcesRestore).toHaveBeenCalled(),
    );
    expect(consumerCalls()).toEqual([]);
  });

  it('does not offer the details popup on the details page', async () => {
    const user = userEvent.setup();
    renderHero(baseResource);
    await openActions(user);

    await screen.findByText('Pull');
    expect(screen.queryByText('View details')).toBeNull();
  });
});
