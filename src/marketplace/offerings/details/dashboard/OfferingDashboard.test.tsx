import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useMediaQuery } from 'react-responsive';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  vi,
} from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { useUser } from '@/workspace/hooks';

import { OfferingDashboard } from './OfferingDashboard';

vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('react-responsive', () => ({ useMediaQuery: vi.fn() }));

vi.mock('@/marketplace/utils', () => ({
  isExperimentalUiComponentsVisible: () => false,
}));

vi.mock('./ComponentsUsage', () => ({
  ComponentsUsage: () => <div>components usage</div>,
}));
vi.mock('./OfferingResourcesAndUsers', () => ({
  OfferingResourcesAndUsers: () => <div>resources and users</div>,
}));
vi.mock('./OfferingAgentInfo', () => ({ OfferingAgentInfo: () => null }));
vi.mock('./OfferingAlerts', () => ({ OfferingAlerts: () => null }));
vi.mock('./OfferingServices', () => ({ OfferingServices: () => null }));
vi.mock('./OfferingComponentUsagePanel', () => ({
  OfferingComponentUsagePanel: () => null,
}));

const PROVIDER_CUSTOMER = 'provider-customer-uuid';
const offering = { uuid: 'offering-uuid', customer_uuid: PROVIDER_CUSTOMER };

const ANALYST = 'Provider analyst';
const OPERATOR = 'Provider operator';

const providerUser = (role_name: string) => ({
  is_staff: false,
  is_support: false,
  permissions: [
    {
      scope_type: 'service_provider',
      scope_uuid: 'service-provider-uuid',
      customer_uuid: PROVIDER_CUSTOMER,
      role_name,
    },
  ],
});

let originalRoles: typeof ENV.roles;

beforeAll(() => {
  originalRoles = ENV.roles;
  ENV.roles = [
    ...(originalRoles || []),
    {
      name: ANALYST,
      permissions: [PermissionEnum.GET_SERVICE_PROVIDER_STATISTICS],
    },
    { name: OPERATOR, permissions: [PermissionEnum.LIST_ORDERS] },
  ] as typeof ENV.roles;
});

afterAll(() => {
  ENV.roles = originalRoles;
});

const renderDashboard = () =>
  render(<OfferingDashboard offering={offering as any} />);

describe.each([false, true])(
  'OfferingDashboard (small screen: %s)',
  (small) => {
    beforeEach(() => {
      (useMediaQuery as Mock).mockReturnValue(small);
    });

    it('shows the statistics cards to a provider role holding statistics', () => {
      (useUser as Mock).mockReturnValue(providerUser(ANALYST));
      renderDashboard();
      expect(screen.getByText('components usage')).toBeInTheDocument();
      if (!small) {
        expect(screen.getByText('resources and users')).toBeInTheDocument();
      }
    });

    it('hides the statistics cards from a provider role without statistics', () => {
      (useUser as Mock).mockReturnValue(providerUser(OPERATOR));
      renderDashboard();
      expect(screen.queryByText('components usage')).not.toBeInTheDocument();
      expect(screen.queryByText('resources and users')).not.toBeInTheDocument();
    });

    it('shows the statistics cards to support', () => {
      (useUser as Mock).mockReturnValue({
        is_staff: false,
        is_support: true,
        permissions: [],
      });
      renderDashboard();
      expect(screen.getByText('components usage')).toBeInTheDocument();
      if (!small) {
        expect(screen.getByText('resources and users')).toBeInTheDocument();
      }
    });
  },
);
