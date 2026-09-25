import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { RolesPage } from './RolesPage';

// Stub the shared TableWithTabs so the test asserts which tabs the page builds,
// not the tab machinery (which TableWithTabs owns and tests).
vi.mock('@/table/TableWithTabs', () => ({
  TableWithTabs: ({ title, tabs }: any) => (
    <div>
      <span>{title}</span>
      {tabs.map((tab: any) => (
        <span key={tab.key}>{tab.title}</span>
      ))}
    </div>
  ),
}));

const renderPage = (user: { is_staff: boolean; is_support?: boolean }) => {
  const store = createStore(() => ({ workspace: { user } }) as any);
  return render(
    <Provider store={store}>
      <RolesPage />
    </Provider>,
  );
};

describe('RolesPage', () => {
  it('shows the catalogue, availability and hygiene tabs to staff', () => {
    renderPage({ is_staff: true });

    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('Hygiene')).toBeInTheDocument();
  });

  // Both endpoints are staff-only on the backend: role-availabilities returns an
  // empty queryset and the hygiene report is IsStaff, so a support user would
  // otherwise get an unexplained empty table and a 403.
  it('shows a support user the catalogue only', () => {
    renderPage({ is_staff: false, is_support: true });

    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.queryByText('Availability')).not.toBeInTheDocument();
    expect(screen.queryByText('Hygiene')).not.toBeInTheDocument();
  });
});
