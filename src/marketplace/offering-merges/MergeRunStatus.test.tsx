import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OfferingMerge } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { MergeCheckDetailsDialog } from './MergeCheckDetailsDialog';
import { MergeVerification } from './MergeRunStatus';

// The checks table keeps its state in the Redux store; resolve its in-memory
// rows and render the cells, which is where the summary and the dialog live.
vi.mock('@/table/useTable', async () => {
  const { useEffect, useState } = await import('react');
  return {
    useTable: (config: any) => {
      const [rows, setRows] = useState<any[]>([]);
      useEffect(() => {
        let alive = true;
        config
          .fetchData({ currentPage: 1, pageSize: 10 })
          .then((page: any) => alive && setRows(page.rows));
        return () => {
          alive = false;
        };
      }, []);
      return { rows, fetch: vi.fn() };
    },
  };
});

vi.mock('@/table/Table', () => ({
  default: (props: any) => (
    <div data-testid="table">
      {props.rows.map((row: any, index: number) => (
        <div key={index} data-testid="row">
          {props.columns.map((column: any, cell: number) => (
            <span key={cell}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const failing = {
  code: 'invoice_items_rewritten',
  passed: false,
  details: { expected: 5, rewritten: 4, items: ['item-1'] },
};

const merge = {
  uuid: 'merge',
  error_message: '',
  verification: {
    passed: false,
    execute: {
      passed: false,
      checked_at: '2026-09-19T10:00:00Z',
      checks: [failing, { code: 'no_orphans', passed: true, details: {} }],
    },
    undo: {
      passed: true,
      checked_at: '2026-09-19T11:00:00Z',
      checks: [{ code: 'resources_returned', passed: true, details: {} }],
    },
  },
} as unknown as OfferingMerge;

describe('MergeVerification', () => {
  beforeEach(() => vi.mocked(useModal().openDialog).mockClear());

  it('summarises the details in the row and keeps the result visible', async () => {
    renderWithProviders(<MergeVerification merge={merge} />);

    await waitFor(() => expect(screen.getAllByTestId('row')).toHaveLength(3));
    expect(
      screen.getByText('Expected: 5, Rewritten: 4, Items: 1 item(s)'),
    ).toBeInTheDocument();
    // The failed check is recognisable without opening anything.
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
  });

  it('names each report, so the two check tables are told apart', async () => {
    renderWithProviders(<MergeVerification merge={merge} />);

    await waitFor(() => expect(screen.getAllByTestId('row')).toHaveLength(3));
    const headings = screen
      .getAllByTestId('section-heading')
      .map((heading) => heading.textContent);
    expect(headings[0]).toContain('Verification after the merge');
    expect(headings[1]).toContain('Verification after the undo');
    // Each heading carries the help bubble that explains the checks.
    expect(screen.getAllByTestId('help-tip')).toHaveLength(2);
  });

  it('opens the details dialog from the row', async () => {
    renderWithProviders(<MergeVerification merge={merge} />);

    await waitFor(() => expect(screen.getAllByTestId('row')).toHaveLength(3));
    await userEvent.click(
      screen.getByText('Expected: 5, Rewritten: 4, Items: 1 item(s)'),
    );
    expect(useModal().openDialog).toHaveBeenCalledWith(
      MergeCheckDetailsDialog,
      expect.objectContaining({ resolve: { check: failing } }),
    );
  });

  it('shows a dash for a check that carries no details', async () => {
    renderWithProviders(<MergeVerification merge={merge} />);

    await waitFor(() => expect(screen.getAllByTestId('row')).toHaveLength(3));
    // Only the check with details is clickable.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
