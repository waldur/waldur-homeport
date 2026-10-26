import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { AdministrationSoftwareCatalog } from './AdministrationSoftwareCatalog';

// Render only the catalogs tab, and a table that shows which actions it was
// given, so the test asserts what the page offers rather than the table.
vi.mock('@/table/TableWithTabs', () => ({
  TableWithTabs: ({ tabs }: any) => {
    const CatalogsTab = tabs[0].component;
    return <CatalogsTab />;
  },
}));

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn() }),
}));

vi.mock('@/table/Table', () => ({
  default: ({ tableActions, rowActions }: any) => (
    <div>
      {tableActions}
      {rowActions ? <span>Row actions</span> : null}
    </div>
  ),
}));

const renderPage = (user: { is_staff: boolean; is_support?: boolean }) => {
  const store = createStore(() => ({ workspace: { user } }) as any);
  return render(
    <Provider store={store}>
      <AdministrationSoftwareCatalog />
    </Provider>,
  );
};

describe('AdministrationSoftwareCatalog', () => {
  it('offers staff the catalog discovery and update actions', () => {
    renderPage({ is_staff: true });

    expect(screen.getByText('Check for updates')).toBeInTheDocument();
    expect(screen.getByText('Row actions')).toBeInTheDocument();
  });

  // Discovering and updating catalogs answer support users with 403.
  it('offers a support user neither action', () => {
    renderPage({ is_staff: false, is_support: true });

    expect(screen.queryByText('Check for updates')).not.toBeInTheDocument();
    expect(screen.queryByText('Row actions')).not.toBeInTheDocument();
  });
});
