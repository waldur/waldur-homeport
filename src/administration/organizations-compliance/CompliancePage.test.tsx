import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { CompliancePage } from './CompliancePage';

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
      <CompliancePage />
    </Provider>,
  );
};

describe('CompliancePage', () => {
  it('shows staff the checklists and user agreements tabs', () => {
    renderPage({ is_staff: true });

    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Checklists')).toBeInTheDocument();
    expect(screen.getByText('User agreements')).toBeInTheDocument();
  });

  // Checklist management was a staff-only page.
  it('shows a support user the user agreements only', () => {
    renderPage({ is_staff: false, is_support: true });

    expect(screen.queryByText('Checklists')).not.toBeInTheDocument();
    expect(screen.getByText('User agreements')).toBeInTheDocument();
  });
});
