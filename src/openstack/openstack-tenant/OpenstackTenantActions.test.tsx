import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { OpenstackTenantActions } from './OpenstackTenantActions';

const mockStore = configureMockStore();

vi.mock('@waldur/i18n', () => ({
  translate: (key) => key,
}));

vi.mock('@waldur/features/connect', () => ({
  isFeatureVisible: () => true,
}));

vi.mock('@waldur/core/config', () => ({
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
  return render(
    <Provider store={store}>
      <OpenstackTenantActions {...props} />
    </Provider>,
  );
};

const mockMarketplaceResource = {
  uuid: 'test-market-uuid',
  state: 'OK',
  customer_uuid: 'customer-uuid',
  name: 'Test Market Resource',
  offering_customer_uuid: 'offering-uuid',
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
      'Change plan',
      'Show usage',
      'Report usage',
      'Set backend ID',
      'Submit report',
      'Set termination date',
      'Set as erred',
      'Move',
      'Unlink',
      'Terminate',
    ]);
  });
});
