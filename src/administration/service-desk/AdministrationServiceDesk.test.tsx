import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { AdministrationServiceDesk } from './AdministrationServiceDesk';

vi.mock('@/navigation/useUrlTab', () => ({
  useUrlTab: () => ({ activeKey: 'configuration', handleSelect: vi.fn() }),
}));

vi.mock('./issue-statuses', () => ({ IssueStatusList: () => null }));

vi.mock('../support-users/SupportUsersList', () => ({
  SupportUsersList: () => null,
}));

const renderPage = (user: { is_staff: boolean; is_support?: boolean }) => {
  const store = createStore(() => ({ workspace: { user } }) as any);
  return renderWithProviders(
    <Provider store={store}>
      <AdministrationServiceDesk />
    </Provider>,
  );
};

let support;

beforeEach(() => {
  vi.mocked(overrideSettingsRetrieve).mockResolvedValue({ data: {} } as any);
  support = ENV.plugins.WALDUR_SUPPORT;
  (ENV.plugins as any).WALDUR_SUPPORT = { ENABLED: true };
});

afterEach(() => {
  (ENV.plugins as any).WALDUR_SUPPORT = support;
});

describe('AdministrationServiceDesk', () => {
  it('shows staff the issue status mapping', async () => {
    renderPage({ is_staff: true });

    expect(await screen.findByText('Support users')).toBeInTheDocument();
    expect(screen.getByText('Issue status mapping')).toBeInTheDocument();
  });

  // The issue status endpoint answers support with 403.
  it('hides the issue status mapping from a support user', async () => {
    renderPage({ is_staff: false, is_support: true });

    expect(await screen.findByText('Support users')).toBeInTheDocument();
    expect(screen.queryByText('Issue status mapping')).not.toBeInTheDocument();
  });
});
