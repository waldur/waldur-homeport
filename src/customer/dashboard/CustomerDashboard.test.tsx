import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersStatsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useCustomer, useUser } from '@/workspace/hooks';

import { CustomerDashboard } from './CustomerDashboard';

vi.mock('@/project/ProjectsList', () => ({
  ProjectsList: () => <div data-testid="projects-list" />,
}));
vi.mock('@/marketplace/aggregate-limits/usage-views/UsageViewsSection', () => ({
  UsageViewsSection: () => null,
  hasVisibleUsageViews: () => false,
}));
vi.mock('./CustomerDashboardChart', () => ({
  CustomerDashboardChart: () => null,
}));
vi.mock('./CustomerProfile', () => ({
  CustomerProfile: () => <div data-testid="customer-profile" />,
}));

const CUSTOMER_UUID = 'customer-uuid';

// CUSTOMER.MANAGER is held on the organization's service provider.
const serviceManagerPermission = {
  role_name: 'CUSTOMER.MANAGER',
  scope_type: 'service_provider',
  scope_uuid: 'provider-uuid',
  customer_uuid: CUSTOMER_UUID,
};

describe('CustomerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersStatsRetrieve).mockResolvedValue({ data: {} } as any);
  });

  // The page hero renders the profile, so the dashboard must not repeat it.
  it('shows staff who also manage the provider the full dashboard', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      permissions: [serviceManagerPermission],
    } as any);
    vi.mocked(useCustomer).mockReturnValue({
      uuid: CUSTOMER_UUID,
      is_service_provider_manager_only: false,
    } as any);

    renderWithProviders(<CustomerDashboard />);

    expect(screen.getByTestId('projects-list')).toBeInTheDocument();
    expect(screen.queryByTestId('customer-profile')).not.toBeInTheDocument();
  });

  it('renders nothing for a user who only manages the provider', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [serviceManagerPermission],
    } as any);
    vi.mocked(useCustomer).mockReturnValue({
      uuid: CUSTOMER_UUID,
      is_service_provider_manager_only: true,
    } as any);

    const { container } = renderWithProviders(<CustomerDashboard />);

    expect(container).toBeEmptyDOMElement();
  });
});
