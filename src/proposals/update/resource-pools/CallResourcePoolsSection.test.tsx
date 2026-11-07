import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsResourcePoolUsageList,
  proposalProtectedCallsResourcePoolsPartialUpdate,
  proposalProtectedCallsResourcePoolsSet,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { useModal } from '@/modal/actions';
import { tablesReducer } from '@/table/store';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { CallResourcePoolsSection } from './CallResourcePoolsSection';

const usage = vi.mocked(proposalProtectedCallsResourcePoolUsageList);
const update = vi.mocked(proposalProtectedCallsResourcePoolsPartialUpdate);
const create = vi.mocked(proposalProtectedCallsResourcePoolsSet);

const call = {
  uuid: 'call1',
  state: 'active',
  rounds: [
    { uuid: 'round2', name: 'Spring', start_time: '2026-03-01T00:00:00Z' },
    { uuid: 'round1', name: 'Winter', start_time: '2026-01-01T00:00:00Z' },
  ],
} as any;

const row = {
  offering_component_uuid: 'rule1',
  requested_offering_uuid: 'ro1',
  offering_name: 'HPC',
  component_type: 'cpu_hours',
  component_name: 'CPU hours',
  measured_unit: 'hours',
  limit_period: 'total',
  cells: [
    {
      round_uuid: null,
      round_name: null,
      pool_uuid: 'pool1',
      offered_total: 1000000,
      requested: 500000,
      awarded: 300000,
      remaining: 700000,
    },
    {
      round_uuid: 'round1',
      round_name: 'Winter',
      pool_uuid: 'pool2',
      offered_total: 400000,
      requested: 450000,
      awarded: 410000,
      remaining: -10000,
    },
    {
      round_uuid: 'round2',
      round_name: 'Spring',
      pool_uuid: null,
      offered_total: null,
      requested: 0,
      awarded: 0,
      remaining: null,
    },
  ],
};

const renderSection = () =>
  renderWithProviders(
    <DrawerProvider>
      {/* A real tables reducer: a row's details open on its expander. */}
      <Provider store={createStore(combineReducers({ tables: tablesReducer }))}>
        <CallResourcePoolsSection call={call} />
      </Provider>
    </DrawerProvider>,
  );

// The pool is edited from the row's menu, in a dialog: the menu item opens
// it, and the dialog is rendered as the modal layer would.
const openEdit = async (user) => {
  await user.click(await screen.findByTestId('actions-toggle'));
  await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
  const openDialog = vi.mocked(useModal().openDialog);
  await waitFor(() => expect(openDialog).toHaveBeenCalled());
  const [dialog, props] = openDialog.mock.calls.at(-1) as any;
  renderWithProviders(createElement(dialog, props));
};

describe('CallResourcePoolsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usage.mockResolvedValue(mockListResponse([row]));
    update.mockResolvedValue({ data: {} } as any);
    create.mockResolvedValue({ data: {} } as any);
  });

  it('shows a component by round matrix, rounds in the order they start', async () => {
    renderSection();
    expect(await screen.findByText('HPC / CPU hours')).toBeInTheDocument();
    const headers = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent);
    expect(headers.join('|')).toMatch(/Whole call.*Winter.*Spring/);
    expect(screen.getByText('1,000,000 hours')).toBeInTheDocument();
    expect(screen.getByText('No pool')).toBeInTheDocument();
    expect(
      screen.getByText('What the call awards per component and round.'),
    ).toBeInTheDocument();
    // An overdrawn pool warns on its line; the figures are in the details.
    expect(screen.getByLabelText('Warning')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('row-expander'));
    expect(await screen.findByText(/Remaining -10,000/)).toBeInTheDocument();
  });

  it('warns of a round pool above the whole call’s', async () => {
    const [wholeCall, winter, spring] = row.cells;
    usage.mockResolvedValue(
      mockListResponse([
        {
          ...row,
          cells: [wholeCall, { ...winter, offered_total: 2000000 }, spring],
        },
      ]),
    );
    renderSection();
    await screen.findByText('Winter');
    // Winter is overdrawn as well, so its line carries both warnings.
    await waitFor(() =>
      expect(screen.getAllByLabelText('Warning')).toHaveLength(2),
    );
  });

  it('does not warn of a round pool within the whole call’s', async () => {
    renderSection();
    await screen.findByText('Winter');
    // Only the overdrawn round's warning.
    expect(screen.getAllByLabelText('Warning')).toHaveLength(1);
  });

  it('edits an offered total in place', async () => {
    const user = userEvent.setup();
    renderSection();
    await openEdit(user);
    const input = await screen.findByDisplayValue('400000');
    await user.clear(input);
    await user.type(input, '450000');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        path: { uuid: 'call1', obj_uuid: 'pool2' },
        body: { offered_total: 450000 },
      }),
    );
  });

  it('adds a pool to a cell without one', async () => {
    const user = userEvent.setup();
    renderSection();
    await openEdit(user);
    await user.type(await screen.findByLabelText(/Spring/), '300000');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        path: { uuid: 'call1' },
        body: {
          offering_component_uuid: 'rule1',
          round_uuid: 'round2',
          offered_total: 300000,
        },
      }),
    );
  });

  it('adds a pool to a component without a rule by naming it', async () => {
    const user = userEvent.setup();
    usage.mockResolvedValue(
      mockListResponse([{ ...row, offering_component_uuid: null }]),
    );
    renderSection();
    await user.click(await screen.findByTestId('row-expander'));
    expect(await screen.findByText('Any amount')).toBeInTheDocument();
    await openEdit(user);
    // The expanded row names the round too; the field is the dialog's.
    const [field] = (await screen.findAllByLabelText(/Spring/)).filter(
      (element) => element.tagName === 'INPUT',
    );
    await user.type(field, '300000');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        path: { uuid: 'call1' },
        body: {
          requested_offering: 'ro1',
          component: 'cpu_hours',
          round_uuid: 'round2',
          offered_total: 300000,
        },
      }),
    );
  });

  it('offers no edit on a read-only call', async () => {
    renderWithProviders(
      <DrawerProvider>
        <Provider store={configureStore()({ tables: {} })}>
          <CallResourcePoolsSection call={call} isReadOnly />
        </Provider>
      </DrawerProvider>,
    );
    expect(await screen.findByText('HPC / CPU hours')).toBeInTheDocument();
    // The menu is there but disabled, saying why.
    expect(screen.getByTestId('actions-toggle')).toBeDisabled();
    expect(
      screen.queryByRole('menuitem', { name: 'Edit' }),
    ).not.toBeInTheDocument();
  });
});
