import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { DESCRIPTION } from './description.fixture';
import { NotificationMatrix } from './NotificationMatrix';
import { RoleMatrix } from './RoleMatrix';

// The shared table needs the app's store; a plain grid of the same rows and
// columns is enough to read the cells.
vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [], pagination: {} }),
}));
vi.mock('@/table/useRowsTable', () => ({
  useRowsTable: (_name: string, rows: unknown[]) => ({
    fetch: vi.fn(),
    rows,
    pagination: {},
  }),
}));
vi.mock('@/table/Table', () => ({
  default: (props: any) => (
    <div>
      <div>
        {props.columns.map((column, index) => (
          <span key={index} data-row-header={column.rowHeader ? 'true' : null}>
            {column.title}
          </span>
        ))}
      </div>
      {props.rows.map((row, index) => (
        <div
          key={index}
          data-testid="row"
          className={
            typeof props.rowClass === 'function'
              ? props.rowClass({ row })
              : props.rowClass
          }
        >
          {props.rowGroupHeader && (
            <div data-testid="group-header">
              {props.rowGroupHeader({ row, rowIndex: index, rows: props.rows })}
            </div>
          )}
          {props.columns.map((column, columnIndex) => {
            const Render = column.render;
            return <Render key={columnIndex} row={row} />;
          })}
        </div>
      ))}
    </div>
  ),
}));

describe('RoleMatrix', () => {
  it('names each mark in words: the role, then what it does', async () => {
    renderWithProviders(
      <RoleMatrix description={DESCRIPTION} onOpenStep={vi.fn()} />,
    );
    await screen.findByText('Consolidated report');
    // The step heads its row, so every mark is heard with the step's name.
    expect(screen.getByText('Step')).toHaveAttribute('data-row-header', 'true');
    const row = screen.getAllByTestId('row')[0];
    const completes = within(row).getByRole('button', { name: 'Completes' });
    const contributes = within(row).getByRole('button', {
      name: 'Contributes',
    });
    // Each mark is an icon badge, a button named by its flag.
    expect(contributes).toHaveAttribute('aria-label', 'Contributes');
    // The cell opens with its role: "Offering team: Contributes, Completes".
    expect(within(row).getByText(/^Offering team:/)).toHaveClass('sr-only');
    // A mark that opens the step says so.
    expect(completes).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('opens the step dialog on the page of the field behind a mark', async () => {
    const user = userEvent.setup();
    const onOpenStep = vi.fn();
    renderWithProviders(
      <RoleMatrix description={DESCRIPTION} onOpenStep={onOpenStep} />,
    );
    await screen.findByText('Consolidated report');
    // The third step's row.
    const row = screen.getAllByTestId('row')[2];
    const marks = within(row).getAllByTestId('matrix-mark-completes');
    expect(marks).toHaveLength(1);
    await user.click(marks[0]);
    expect(onOpenStep).toHaveBeenCalledWith('report', 'participants');
  });

  it('lists the steps without stage header rows', async () => {
    renderWithProviders(<RoleMatrix description={DESCRIPTION} />);
    await screen.findByText('Consolidated report');
    expect(screen.queryByText('Runs in parallel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('group-header')).not.toBeInTheDocument();
  });

  it('shows one role only when asked', async () => {
    renderWithProviders(
      <RoleMatrix description={DESCRIPTION} actorKey="panel_chair" />,
    );
    await screen.findByText('Rapporteur assignment');
    // The role's parts become the columns, each a yes or no.
    expect(screen.getByText('Completes')).toBeInTheDocument();
    expect(screen.queryByTestId('matrix-mark-completes')).toBeNull();
    expect(screen.queryByText('Applicant')).not.toBeInTheDocument();
  });
});

describe('NotificationMatrix', () => {
  it('places every rule in a cell, disabled ones muted', async () => {
    renderWithProviders(<NotificationMatrix description={DESCRIPTION} />);
    await screen.findByText('Step started');
    expect(screen.getAllByTestId('notification-rule')).toHaveLength(2);
    expect(screen.getByText(/\(disabled\)/)).toBeInTheDocument();
  });

  it('keeps what to look at and the mail always sent on tabs of their own', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationMatrix description={DESCRIPTION} />);
    await user.click(screen.getByRole('tab', { name: /To look at/ }));
    // The row names the problem; its explanation is in the expanded row.
    expect(
      (await screen.findAllByText(/May tell the applicant too much/)).length,
    ).toBeGreaterThan(0);
    await user.click(screen.getByRole('tab', { name: 'Always sent' }));
    expect(
      await screen.findByText(/Proposal accepted or rejected/),
    ).toBeInTheDocument();
  });

  it('leaves the tab of things to look at out when there are none', () => {
    renderWithProviders(
      <NotificationMatrix
        description={{
          ...DESCRIPTION,
          notifications: { ...DESCRIPTION.notifications, flags: [] },
        }}
      />,
    );
    expect(
      screen.queryByRole('tab', { name: /To look at/ }),
    ).not.toBeInTheDocument();
  });
});

describe('A disabled step', () => {
  // The report step, turned off.
  const withDisabled = {
    ...DESCRIPTION,
    steps: DESCRIPTION.steps.map((step) =>
      step.key === 'report' ? { ...step, enabled: false } : step,
    ),
  } as typeof DESCRIPTION;

  it('is marked in words and by style, never faded, in the role matrix', async () => {
    renderWithProviders(<RoleMatrix description={withDisabled} />);
    await screen.findByText('Consolidated report');
    const row = screen.getAllByTestId('row')[2];
    // Faded text falls under 4.5:1; italic in the muted colour does not.
    expect(row).toHaveClass('step-row--disabled');
    expect(row).not.toHaveClass('opacity-50');
    expect(within(row).getByText('Disabled')).toBeInTheDocument();
  });

  it('is marked the same way in the notification matrix', async () => {
    renderWithProviders(<NotificationMatrix description={withDisabled} />);
    const rows = await screen.findAllByTestId('row');
    const disabled = rows.filter((row) =>
      row.classList.contains('step-row--disabled'),
    );
    expect(disabled.length).toBeGreaterThan(0);
    for (const row of disabled) {
      expect(row).not.toHaveClass('opacity-50');
      expect(within(row).getByText('Disabled')).toBeInTheDocument();
    }
  });
});
