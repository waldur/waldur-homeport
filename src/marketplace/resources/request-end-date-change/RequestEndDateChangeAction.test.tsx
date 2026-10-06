import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { RequestEndDateChangeAction } from './RequestEndDateChangeAction';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: () => false,
}));

// What an OpenStack menu passes: the plugin resource, which carries no end
// dates, with the marketplace resource loaded beside it.
const pluginResource = {
  uuid: 'tenant-uuid',
  state: 'OK',
  marketplace_resource_uuid: 'marketplace-uuid',
  customer_uuid: 'customer-uuid',
};
const marketplaceResource = {
  uuid: 'marketplace-uuid',
  state: 'OK',
  customer_uuid: 'customer-uuid',
  offering_type: 'OpenStack.Tenant',
  end_date: '2026-11-25',
  project_end_date: '2027-06-30',
};

const OFFERING_KEY = ['resource-offering', 'marketplace-uuid'];
const optedIn = { enable_resource_end_date_change_requests: true };

const mockOffering = (data) =>
  vi.mocked(marketplaceResourcesOfferingRetrieve).mockResolvedValue({
    data,
  } as any);

const renderAction = (props) =>
  renderWithProviders(
    inActionsMenu(<RequestEndDateChangeAction refetch={vi.fn()} {...props} />),
  );

const waitUntilLoaded = (queryClient: QueryClient) =>
  waitFor(() =>
    expect(queryClient.getQueryState(OFFERING_KEY)?.status).toBe('success'),
  );

describe('RequestEndDateChangeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Project admin: not staff/support and no RESOURCE.SET_END_DATE.
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-uuid' } as any);
  });

  it('opens the request with the marketplace resource end dates', async () => {
    mockOffering({ plugin_options: optedIn, components: [] });

    renderAction({ resource: pluginResource, marketplaceResource });

    await userEvent.click(await screen.findByText('Request end date change'));
    const [, options] = vi.mocked(useModal().openDialog).mock.calls[0];
    expect(options.resolve.resource).toMatchObject({
      marketplace_resource_uuid: 'marketplace-uuid',
      end_date: '2026-11-25',
      project_end_date: '2027-06-30',
    });
  });

  it('hides the action when the offering does not accept requests', async () => {
    mockOffering({ plugin_options: {}, components: [] });

    const { queryClient } = renderAction({
      resource: pluginResource,
      marketplaceResource,
    });

    await waitUntilLoaded(queryClient);
    expect(screen.queryByText('Request end date change')).toBeNull();
  });

  it('hides the action for prepaid offerings, which extend through renewal', async () => {
    mockOffering({
      plugin_options: optedIn,
      components: [{ is_prepaid: true }],
    });

    const { queryClient } = renderAction({
      resource: pluginResource,
      marketplaceResource,
    });

    await waitUntilLoaded(queryClient);
    expect(screen.queryByText('Request end date change')).toBeNull();
  });

  it('does not render or fetch the offering for users who set the date directly', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);

    renderAction({ resource: pluginResource, marketplaceResource });

    expect(screen.queryByText('Request end date change')).toBeNull();
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
  });
});
