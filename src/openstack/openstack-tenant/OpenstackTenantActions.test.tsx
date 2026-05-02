import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { OpenstackTenantActions } from './OpenstackTenantActions';

const mockStore = configureMockStore();

vi.mock('@/i18n', () => ({
  translate: (key) => key,
  formatJsx: (key) => key,
  formatJsxTemplate: (key) => key,
}));

vi.mock('@/features/connect', () => ({
  isFeatureVisible: () => true,
}));

vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        ONLY_STAFF_MANAGES_SERVICES: false,
      },
      WALDUR_OPENSTACK: { TENANT_CREDENTIALS_VISIBLE: true },
    },
  },
}));

const renderComponent = (props = {}) => {
  const store = mockStore({
    workspace: {
      user: {
        is_staff: true,
      },
    },
  });
  const queryClient = new QueryClient();
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <OpenstackTenantActions {...props} />
      </QueryClientProvider>
    </Provider>,
  );
};

const mockMarketplaceResource = {
  uuid: 'test-market-uuid',
  state: 'OK',
  customer_uuid: 'customer-uuid',
  name: 'Test Market Resource',
  provider_uuid: 'offering-uuid',
};
const mockResource = {
  uuid: 'test-scope-uuid',
  state: 'OK',
  marketplace_resource_uuid: 'test-market-uuid',
  customer_uuid: 'customer-uuid',
  name: 'Test Resource',
};

describe('OpenstackTenantActions', () => {
  it('renders action groups with correct titles', () => {
    renderComponent({
      marketplaceResource: mockMarketplaceResource,
      resource: mockResource,
      refetch: vi.fn(),
    });

    expect(
      screen.queryAllByRole('button').map((element) => element.textContent),
    ).toEqual([
      'Edit',
      'Replicate',
      'Synchronise',
      'Show usage',
      'Report usage',
      'Set backend ID',
      'Submit report',
      'Set termination date',
      'Set as erred',
      'Move',
      'Unlink',
      'Mark as ERRED',
      'Mark as OK',
      'Terminate',
    ]);
  });
});
