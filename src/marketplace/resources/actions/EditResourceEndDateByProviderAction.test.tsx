import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { EditResourceEndDateByProviderAction } from './EditResourceEndDateByProviderAction';

const { hasPermission } = vi.hoisted(() => ({ hasPermission: vi.fn() }));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: (...args: any[]) => hasPermission(...args),
}));
// The action reads the offering only to spot prepaid components; an empty one
// keeps the prepaid branch out of the way.
vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useQuery: () => ({ data: { components: [] } }),
}));

const setUser = (value: any) => vi.mocked(useUser).mockReturnValue(value);

const resource = {
  uuid: 'mp-uuid',
  marketplace_resource_uuid: 'mp-uuid',
  provider_uuid: 'provider-uuid',
  customer_uuid: 'customer-uuid',
} as any;

const render = () =>
  renderWithProviders(
    <EditResourceEndDateByProviderAction resource={resource} />,
  );

describe('EditResourceEndDateByProviderAction', () => {
  it('renders for a user holding the permission on the provider', () => {
    setUser({ is_support: false, is_staff: false });
    hasPermission.mockReturnValue(true);
    render();
    expect(screen.getByText('Set termination date')).toBeInTheDocument();
  });

  it('does not render for support alone', () => {
    // It calls marketplace-provider-resources/set_end_date, guarded by
    // user_can_set_end_date_as_provider — a permission_factory with no support
    // bypass. Rendering for support offered a button that answers 403; only the
    // deprecated set_end_date_by_provider ever let support through.
    setUser({ is_support: true, is_staff: false });
    hasPermission.mockReturnValue(false);
    render();
    expect(screen.queryByText('Set termination date')).not.toBeInTheDocument();
  });

  it('is hidden when the offering disables the termination date action', () => {
    setUser({ is_support: false, is_staff: false });
    hasPermission.mockReturnValue(true);
    renderWithProviders(
      <EditResourceEndDateByProviderAction
        resource={
          {
            ...resource,
            offering_plugin_options: {
              disabled_resource_actions: ['edit_termination_date'],
            },
          } as any
        }
      />,
    );
    expect(screen.queryByText('Set termination date')).not.toBeInTheDocument();
  });
});
