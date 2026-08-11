import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { DateTime, Settings } from 'luxon';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TABLE_KEY as AUTHENTICATED_TABLE } from '@/support/SupportAIAssistantLogsList';
import * as tableActions from '@/table/actions';

import { TABLE_KEY as ANONYMOUS_TABLE } from './AnonymousChatPanel';
import { SupportAIAssistantDashboard } from './SupportAIAssistantDashboard';

// Stub the shared TableWithTabs so the test asserts the dashboard's tab
// configuration and its header control, not the tab machinery (which
// TableWithTabs owns and tests).
vi.mock('@/table/TableWithTabs', () => ({
  TableWithTabs: ({ title, tabs, headerActions }: any) => (
    <div>
      <span>{title}</span>
      {headerActions}
      {tabs.map((tab: any) => (
        <span key={tab.key}>{tab.title}</span>
      ))}
    </div>
  ),
}));

// Resolved eagerly: a Settings.now that parses a date on each call recurses,
// because luxon reads Settings.now while constructing the DateTime.
const FIXED_NOW = DateTime.fromISO('2026-08-10').toMillis();

const dispatched: any[] = [];

const storedRange = (min: string, max: string) => [
  { name: 'created_range', value: { min, max }, label: null, component: null },
];

const renderDashboard = ({
  filters = {},
  tab,
}: { filters?: Record<string, any[]>; tab?: string } = {}) => {
  dispatched.length = 0;
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    params: { tab },
  } as any);
  const state = {
    tables: Object.fromEntries(
      Object.entries(filters).map(([table, filtersStorage]) => [
        table,
        { filtersStorage },
      ]),
    ),
  };
  const store = createStore((current = state, action: any) => {
    dispatched.push(action);
    return current;
  });
  return render(
    <Provider store={store}>
      <SupportAIAssistantDashboard />
    </Provider>,
  );
};

const setFilterActions = () =>
  dispatched.filter((action) => action.type === tableActions.SET_FILTER);

afterEach(() => {
  Settings.now = () => Date.now();
});

describe('SupportAIAssistantDashboard', () => {
  it('renders a tab for each assistant channel', () => {
    renderDashboard();

    expect(screen.getByText('Authenticated chat')).toBeInTheDocument();
    expect(screen.getByText('Anonymous chat')).toBeInTheDocument();
  });

  it('offers the period control in the page header', () => {
    renderDashboard();

    expect(screen.getByText('Time period:')).toBeInTheDocument();
  });

  it('starts unscoped so nothing claims a period until one is chosen', () => {
    // A default range here would silently hide older data on first load, which
    // is the behaviour this dashboard deliberately does not have.
    renderDashboard();

    expect(setFilterActions()).toEqual([]);
    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('shows the preset that a restored filter describes', () => {
    // Regression: the period used to live in component state, so a reload left
    // the table scoped while the control showed its placeholder.
    Settings.now = () => FIXED_NOW;

    renderDashboard({
      filters: {
        [AUTHENTICATED_TABLE]: storedRange('2026-08-04', '2026-08-10'),
      },
    });

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  it('names a range that no preset describes', () => {
    Settings.now = () => FIXED_NOW;

    renderDashboard({
      filters: {
        [AUTHENTICATED_TABLE]: storedRange('2026-01-01', '2026-03-01'),
      },
    });

    expect(screen.getByText('Custom range')).toBeInTheDocument();
  });

  it('reads the period from the tab on screen', () => {
    // The two tables own their filter storage separately, so the header has to
    // describe the one the user is actually looking at.
    //
    // Seeds them out of step on purpose. useSharedChatFilters prevents that at
    // runtime; this pins the read path — which table the control derives from.
    Settings.now = () => FIXED_NOW;

    renderDashboard({
      tab: 'anonymous',
      filters: {
        [AUTHENTICATED_TABLE]: storedRange('2026-01-01', '2026-03-01'),
        [ANONYMOUS_TABLE]: storedRange('2026-08-04', '2026-08-10'),
      },
    });

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  it('applies a chosen preset to the tab on screen', async () => {
    // Reaching the other tab is useSharedChatFilters' job now, so the control
    // writes once instead of keeping its own copy of that rule.
    Settings.now = () => FIXED_NOW;
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('combobox'));
    await user.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Last 7 days',
      }),
    );

    const applied = setFilterActions().filter(
      (action) => action.payload.item.name === 'created_range',
    );
    expect(applied.map((action) => action.payload.table)).toEqual([
      AUTHENTICATED_TABLE,
    ]);
    expect(applied[0].payload.item.value).toEqual({
      min: '2026-08-04',
      max: '2026-08-10',
    });
  });

  it('clears the period on the tab on screen when all time is chosen', async () => {
    Settings.now = () => FIXED_NOW;
    const user = userEvent.setup();
    renderDashboard({
      filters: {
        [AUTHENTICATED_TABLE]: storedRange('2026-08-04', '2026-08-10'),
      },
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'All time',
      }),
    );

    const cleared = setFilterActions().filter(
      (action) =>
        action.payload.item.name === 'created_range' &&
        action.payload.table === AUTHENTICATED_TABLE,
    );
    expect(cleared).toHaveLength(1);
    expect(cleared[0].payload.item.value).toBeNull();
  });
});
