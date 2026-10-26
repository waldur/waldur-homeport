import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { IdentityProvidersList } from './IdentityProvidersList';

vi.mock('../api', () => ({
  getIdentityProviders: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/navigation/useUrlTab', () => ({
  useUrlTab: () => ({ activeKey: 'identity-bridge', handleSelect: vi.fn() }),
}));

vi.mock('./IdentityBridgeTab', () => ({
  IdentityBridgeTab: () => <span>ISD statistics</span>,
}));

const renderPage = (user: { is_staff: boolean; is_support?: boolean }) => {
  const store = createStore(() => ({ workspace: { user } }) as any);
  return renderWithProviders(
    <Provider store={store}>
      <IdentityProvidersList />
    </Provider>,
  );
};

let features;
let authMethods;

beforeEach(() => {
  vi.mocked(overrideSettingsRetrieve).mockResolvedValue({ data: {} } as any);
  features = ENV.FEATURES;
  (ENV as any).FEATURES = { user: { show_identity_bridge: true } };
  // The providers tab renders too (every tab is mounted) and reads this.
  authMethods = ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS;
  (ENV.plugins.WALDUR_CORE as any).AUTHENTICATION_METHODS = [];
});

afterEach(() => {
  (ENV as any).FEATURES = features;
  (ENV.plugins.WALDUR_CORE as any).AUTHENTICATION_METHODS = authMethods;
});

describe('IdentityProvidersList', () => {
  it('shows staff the Identity Bridge statistics', async () => {
    renderPage({ is_staff: true });

    expect(await screen.findByText('ISD statistics')).toBeInTheDocument();
  });

  // The ISD statistics endpoint answers support users with 403; the Identity
  // Bridge settings stay readable.
  it('hides the Identity Bridge statistics from a support user', async () => {
    renderPage({ is_staff: false, is_support: true });

    expect(
      await screen.findByText('Identity & Authentication'),
    ).toBeInTheDocument();
    expect(screen.getByText('Identity Bridge')).toBeInTheDocument();
    expect(screen.queryByText('ISD statistics')).not.toBeInTheDocument();
  });
});
