import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  createMockTableContext,
  renderWithTableContext,
} from '../../test-utils';

import { TableContent } from './TableContent';

describe('TableContent', () => {
  describe('loading state', () => {
    it('renders loading spinner when loading and no rows', () => {
      renderWithTableContext(<TableContent />, {
        loading: true,
        hasRows: false,
        rows: [],
      });

      // Should show loading state (spinner is rendered in h1.text-center)
      expect(document.querySelector('h1.text-center')).toBeInTheDocument();
    });

    it('does not show loading spinner when loading but has rows', () => {
      renderWithTableContext(<TableContent />, {
        loading: true,
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Name', render: () => 'Test' }],
      });

      // Should render table, not loading spinner
      expect(document.querySelector('h1.text-center')).not.toBeInTheDocument();
      expect(document.querySelector('table')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error view when error exists', () => {
      renderWithTableContext(<TableContent />, {
        error: new Error('Failed to load data'),
        hasRows: false,
      });

      // ErrorView renders error information
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders placeholder when no rows and not loading', () => {
      renderWithTableContext(<TableContent />, {
        loading: false,
        hasRows: false,
        rows: [],
      });

      // TablePlaceholder renders empty state message
      expect(screen.getByText(/There are no items yet/i)).toBeInTheDocument();
    });

    it('renders custom placeholder component when provided', () => {
      renderWithTableContext(<TableContent />, {
        loading: false,
        hasRows: false,
        rows: [],
        slots: {
          placeholderComponent: (
            <div data-testid="custom-placeholder">Custom Empty</div>
          ),
        },
      });

      expect(screen.getByTestId('custom-placeholder')).toBeInTheDocument();
      expect(screen.getByText('Custom Empty')).toBeInTheDocument();
    });

    it('shows verboseName in empty message', () => {
      renderWithTableContext(<TableContent />, {
        loading: false,
        hasRows: false,
        rows: [],
        display: { verboseName: 'projects' },
      });

      expect(screen.getByText('No projects found')).toBeInTheDocument();
    });

    it('shows search query in empty message', () => {
      renderWithTableContext(<TableContent />, {
        loading: false,
        hasRows: false,
        rows: [],
        query: 'test search',
        display: { verboseName: 'items' },
      });

      expect(
        screen.getByText(/your search "test search" did not match/i),
      ).toBeInTheDocument();
    });

    it('shows custom empty message when provided', () => {
      renderWithTableContext(<TableContent />, {
        loading: false,
        hasRows: false,
        rows: [],
        display: { emptyMessage: 'Nothing here yet!' },
      });

      expect(screen.getByText('Nothing here yet!')).toBeInTheDocument();
    });
  });

  describe('table mode', () => {
    it('renders table when mode is table and has rows', () => {
      renderWithTableContext(<TableContent />, {
        mode: 'table',
        hasRows: true,
        rows: [{ uuid: '1', name: 'Test Item' }],
        visibleColumns: [
          { id: 'name', title: 'Name', render: ({ row }) => row.name },
        ],
      });

      expect(document.querySelector('table')).toBeInTheDocument();
    });

    it('applies table-hover-shadow class when hoverShadow is true', () => {
      renderWithTableContext(<TableContent />, {
        mode: 'table',
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: { ...createMockTableContext().config, hoverShadow: true },
      });

      expect(document.querySelector('.table-hover-shadow')).toBeInTheDocument();
    });

    it('does not apply table-hover-shadow when hoverShadow is false', () => {
      renderWithTableContext(<TableContent />, {
        mode: 'table',
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: { ...createMockTableContext().config, hoverShadow: false },
      });

      expect(
        document.querySelector('.table-hover-shadow'),
      ).not.toBeInTheDocument();
    });
  });

  describe('grid mode', () => {
    it('renders grid when mode is grid and gridItem is provided', () => {
      const GridItem = ({ row }) => (
        <div data-testid="grid-item">{row.name}</div>
      );

      renderWithTableContext(<TableContent />, {
        mode: 'grid',
        hasRows: true,
        rows: [{ uuid: '1', name: 'Item 1' }],
        slots: { gridItem: GridItem },
      });

      expect(screen.getByTestId('grid-item')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('applies grid-hover-shadow class when hoverShadow is true in grid mode', () => {
      const GridItem = ({ row }) => <div>{row.name}</div>;

      renderWithTableContext(<TableContent />, {
        mode: 'grid',
        hasRows: true,
        rows: [{ uuid: '1', name: 'Item' }],
        slots: { gridItem: GridItem },
        config: { ...createMockTableContext().config, hoverShadow: true },
      });

      expect(document.querySelector('.grid-hover-shadow')).toBeInTheDocument();
    });

    it('renders multiple grid items', () => {
      const GridItem = ({ row }) => (
        <div data-testid={`grid-item-${row.uuid}`}>{row.name}</div>
      );

      renderWithTableContext(<TableContent />, {
        mode: 'grid',
        hasRows: true,
        rows: [
          { uuid: '1', name: 'Item 1' },
          { uuid: '2', name: 'Item 2' },
          { uuid: '3', name: 'Item 3' },
        ],
        slots: { gridItem: GridItem },
      });

      expect(screen.getByTestId('grid-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('grid-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('grid-item-3')).toBeInTheDocument();
    });
  });

  describe('hoverShadow object configuration', () => {
    it('handles hoverShadow as object with table: true', () => {
      renderWithTableContext(<TableContent />, {
        mode: 'table',
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: {
          ...createMockTableContext().config,
          hoverShadow: { table: true, grid: false },
        },
      });

      expect(document.querySelector('.table-hover-shadow')).toBeInTheDocument();
    });

    it('handles hoverShadow as object with table: false', () => {
      renderWithTableContext(<TableContent />, {
        mode: 'table',
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: {
          ...createMockTableContext().config,
          hoverShadow: { table: false, grid: true },
        },
      });

      expect(
        document.querySelector('.table-hover-shadow'),
      ).not.toBeInTheDocument();
    });
  });
});
