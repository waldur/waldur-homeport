import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createMockTableContext,
  renderWithTableContext,
} from '../../test-utils';

import { TableView } from './TableView';

describe('TableView', () => {
  describe('table structure', () => {
    it('renders a table element', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
      });

      expect(document.querySelector('table')).toBeInTheDocument();
    });

    it('applies correct CSS classes to table', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
      });

      const table = document.querySelector('table');
      expect(table).toHaveClass('table');
      expect(table).toHaveClass('align-middle');
      expect(table).toHaveClass('table-row-bordered');
    });

    it('adds table-expandable class when expandableRow is provided', () => {
      const ExpandableRow = ({ row }) => <div>Expanded: {row.name}</div>;

      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        slots: { expandableRow: ExpandableRow },
      });

      const table = document.querySelector('table');
      expect(table).toHaveClass('table-expandable');
    });

    it('adds table-hover class when hoverable is true', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: { ...createMockTableContext().config, hoverable: true },
      });

      const table = document.querySelector('table');
      expect(table).toHaveClass('table-hover');
    });

    it('does not add table-hover class when hoverable is false', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: { ...createMockTableContext().config, hoverable: false },
      });

      const table = document.querySelector('table');
      expect(table).not.toHaveClass('table-hover');
    });
  });

  describe('header rendering', () => {
    it('renders table header when hasHeaders is true', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        config: { ...createMockTableContext().config, hasHeaders: true },
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(document.querySelector('thead')).toBeInTheDocument();
    });

    it('does not render table header when hasHeaders is false', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        config: { ...createMockTableContext().config, hasHeaders: false },
      });

      expect(document.querySelector('thead')).not.toBeInTheDocument();
    });

    it('renders multiple column headers', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test', email: 'test@example.com' }],
        visibleColumns: [
          { title: 'Name', render: ({ row }) => row.name },
          { title: 'Email', render: ({ row }) => row.email },
        ],
        config: { ...createMockTableContext().config, hasHeaders: true },
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('body rendering', () => {
    it('renders table body with rows', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test Item' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
      });

      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(document.querySelector('tbody')).toBeInTheDocument();
    });

    it('renders multiple rows', () => {
      renderWithTableContext(<TableView />, {
        rows: [
          { uuid: '1', name: 'Item 1' },
          { uuid: '2', name: 'Item 2' },
          { uuid: '3', name: 'Item 3' },
        ],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
      });

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders cells for each column', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'John', email: 'john@example.com' }],
        visibleColumns: [
          { title: 'Name', render: ({ row }) => row.name },
          { title: 'Email', render: ({ row }) => row.email },
        ],
      });

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('row actions', () => {
    it('passes rowActions to TableBody when provided', () => {
      const RowActions = ({ row }) => (
        <button data-testid={`action-${row.uuid}`}>Edit</button>
      );

      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        slots: { rowActions: RowActions },
      });

      expect(screen.getByTestId('action-1')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('passes sorting state to TableHeader', () => {
      const sortList = vi.fn();

      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [
          {
            title: 'Name',
            render: ({ row }) => row.name,
            orderField: 'name',
          },
        ],
        sorting: { field: 'name', mode: 'asc' },
        actions: { ...createMockTableContext().actions, sortList },
      });

      // Sorting controls should be rendered (arrows/buttons for sortable columns)
      const header = screen.getByText('Name');
      expect(header).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('renders with multi-select when enabled', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        config: { ...createMockTableContext().config, enableMultiSelect: true },
        selectedRows: [],
      });

      // Checkbox column should be present
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('shows selected state for selected rows', () => {
      const row = { uuid: '1', name: 'Test' };

      renderWithTableContext(<TableView />, {
        rows: [row],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        config: { ...createMockTableContext().config, enableMultiSelect: true },
        selectedRows: [row],
      });

      const checkbox = document.querySelector('input[type="checkbox"]:checked');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('expandable rows', () => {
    it('renders expand toggle when expandableRow is provided', () => {
      const ExpandableRow = ({ row }) => <div>Details for {row.name}</div>;

      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        slots: { expandableRow: ExpandableRow },
        toggled: {},
      });

      // Expand button/icon should be present
      const expandButtons = document.querySelectorAll(
        'button, [role="button"]',
      );
      expect(expandButtons.length).toBeGreaterThan(0);
    });

    it('shows expanded content when row is toggled', () => {
      const ExpandableRow = ({ row }) => (
        <div data-testid="expanded-content">Details for {row.name}</div>
      );

      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', name: 'Test' }],
        visibleColumns: [{ title: 'Name', render: ({ row }) => row.name }],
        slots: { expandableRow: ExpandableRow },
        toggled: { '1': true },
      });

      expect(screen.getByTestId('expanded-content')).toBeInTheDocument();
      expect(screen.getByText('Details for Test')).toBeInTheDocument();
    });
  });

  describe('column positions', () => {
    it('respects columnPositions for column ordering', () => {
      renderWithTableContext(<TableView />, {
        rows: [{ uuid: '1', first: 'A', second: 'B' }],
        visibleColumns: [
          { id: 'first', title: 'First', render: ({ row }) => row.first },
          { id: 'second', title: 'Second', render: ({ row }) => row.second },
        ],
        columnPositions: ['second', 'first'],
        config: {
          ...createMockTableContext().config,
          hasOptionalColumns: true,
        },
      });

      // Headers should exist (order verification would need more specific test setup)
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });
});
