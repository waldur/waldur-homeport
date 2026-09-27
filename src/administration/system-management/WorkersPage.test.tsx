import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { WorkersPage } from './WorkersPage';

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
      <WorkersPage />
    </Provider>,
  );
};

describe('WorkersPage', () => {
  it('shows staff every workers and messaging tab', () => {
    renderPage({ is_staff: true });

    expect(screen.getByText('Workers & messaging')).toBeInTheDocument();
    expect(screen.getByText('Celery')).toBeInTheDocument();
    expect(screen.getByText('RabbitMQ')).toBeInTheDocument();
    expect(screen.getByText('PubSub health')).toBeInTheDocument();
    expect(
      screen.getByText('Event subscriptions (legacy)'),
    ).toBeInTheDocument();
  });

  // The PubSub debug API is staff-only, so a support user would get an error
  // panel instead of a health report.
  it('hides the PubSub tab from a support user', () => {
    renderPage({ is_staff: false, is_support: true });

    expect(screen.getByText('Celery')).toBeInTheDocument();
    expect(screen.getByText('RabbitMQ')).toBeInTheDocument();
    expect(screen.queryByText('PubSub health')).not.toBeInTheDocument();
  });
});
