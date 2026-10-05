import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TableColumnButton } from './TableColumnsButton';

const testColumns = [
  { id: 'name', title: 'Name', keys: ['name'] },
  { id: 'status', title: 'Status', keys: ['status'] },
  { id: 'region', title: 'Region', keys: ['region'], optional: true },
  { id: 'plan', title: 'Plan', keys: ['plan'], optional: true },
];

describe('TableColumnsButton', () => {
  const toggleColumn = vi.fn();
  const swapColumns = vi.fn();
  const initColumnPositions = vi.fn();
  const resetColumns = vi.fn();

  const renderComponent = (props: any = {}) => {
    const activeColumns = {
      name: ['name'],
      status: ['status'],
      region: false,
      plan: false,
      ...(props.activeColumns || {}),
    };

    return render(
      <TableColumnButton
        columns={testColumns}
        activeColumns={activeColumns}
        toggleColumn={toggleColumn}
        swapColumns={swapColumns}
        columnPositions={['name', 'status', 'region', 'plan']}
        initColumnPositions={initColumnPositions}
        resetColumns={resetColumns}
        mode="table"
        {...props}
      />,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button with accessible name', () => {
    renderComponent();
    expect(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    ).toBeInTheDocument();
  });

  it('opens popover dialog with accessible name and list of columns', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    );

    const dialog = await screen.findByRole('dialog', {
      name: 'Visible columns',
    });
    expect(dialog).toBeInTheDocument();

    const list = screen.getByRole('list', { name: 'Columns' });
    expect(list).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: 'Name' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Region' })).not.toBeChecked();
  });

  it('has dedicated drag handles with accessible names for each sortable column', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Reorder column Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reorder column Status' }),
    ).toBeInTheDocument();
  });

  it('toggles column when clicking checkbox or label', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    );

    const regionLabel = await screen.findByText('Region');
    await user.click(regionLabel);

    expect(toggleColumn).toHaveBeenCalledWith('region', testColumns[2]);
  });

  it('filters columns and announces search result counts', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    );

    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search columns',
    });
    await user.type(searchInput, 'reg');

    await waitFor(() => {
      const rows = screen.getAllByTestId('column-row');
      expect(rows).toHaveLength(1);
    });

    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.getByText('Columns found: 1')).toBeInTheDocument();
  });

  it('displays empty state when no columns match the filter', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    );

    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search columns',
    });
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No columns found')).toBeInTheDocument();
    });
    expect(screen.getByText('Columns found: 0')).toBeInTheDocument();
  });

  it('renders Actions column as a valid list item when rowActions is present', async () => {
    const user = userEvent.setup();
    renderComponent({ rowActions: () => null });

    await user.click(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    );

    const actionsCheckbox = await screen.findByRole('checkbox', {
      name: 'Actions',
    });
    expect(actionsCheckbox).toBeInTheDocument();

    await user.click(actionsCheckbox);
    expect(toggleColumn).toHaveBeenCalledWith(
      '__actions__',
      expect.objectContaining({ keys: ['__actions__'] }),
    );
  });

  it('calls resetColumns when reset button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'Toggle visible columns' }),
    );

    const resetButton = await screen.findByRole('button', {
      name: 'Reset settings to default',
    });
    await user.click(resetButton);

    expect(resetColumns).toHaveBeenCalled();
  });
});
