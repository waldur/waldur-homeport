import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it } from 'vitest';

import {
  GRID_HOVER_SHADOW_CLASS,
  TABLE_HOVER_SHADOW_CLASS,
} from '../../styles';
import {
  createMockTableContext,
  renderWithTableContext,
  TableContext,
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

      expect(screen.getByTestId('table-content-loading')).toBeInTheDocument();
      // Not just the wrapper: TableLoadingSpinnerContainer's own spinner
      // (LoadingSpinnerSimple, role="status") must actually render inside
      // it. Previously it silently never did — TableContent.tsx passed
      // only `loading`, never `sorting`, and the container's condition
      // required `sorting` to be truthy even for the plain-loading branch.
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not show loading spinner when loading but has rows', () => {
      renderWithTableContext(<TableContent />, {
        loading: true,
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Name', render: () => 'Test' }],
      });

      expect(
        screen.queryByTestId('table-content-loading'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('refetching state', () => {
    const withRows = {
      hasRows: true,
      rows: [{ uuid: '1' }],
      visibleColumns: [{ title: 'Name', render: () => 'Test' }],
    };

    it('marks the rows busy under a spinner until loading ends', () => {
      const { rerenderWithContext } = renderWithTableContext(<TableContent />, {
        ...withRows,
        loading: true,
      });
      expect(screen.getByTestId('table-container')).toHaveAttribute(
        'aria-busy',
        'true',
      );
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerenderWithContext({ loading: false });

      expect(screen.getByTestId('table-container')).not.toHaveAttribute(
        'aria-busy',
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
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

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('applies table-hover-shadow class when hoverShadow is true', () => {
      renderWithTableContext(<TableContent />, {
        mode: 'table',
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: { ...createMockTableContext().config, hoverShadow: true },
      });

      expect(screen.getByTestId('table-container')).toHaveClass(
        TABLE_HOVER_SHADOW_CLASS,
      );
    });

    it('does not apply table-hover-shadow when hoverShadow is false', () => {
      renderWithTableContext(<TableContent />, {
        mode: 'table',
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
        config: { ...createMockTableContext().config, hoverShadow: false },
      });

      expect(screen.getByTestId('table-container')).not.toHaveClass(
        TABLE_HOVER_SHADOW_CLASS,
      );
    });
  });

  describe('grid mode', () => {
    it('renders grid when mode is grid and gridItem is provided', () => {
      const GridItem = ({ row }) => (
        <div data-testid="test-card">{row.name}</div>
      );

      renderWithTableContext(<TableContent />, {
        mode: 'grid',
        hasRows: true,
        rows: [{ uuid: '1', name: 'Item 1' }],
        slots: { gridItem: GridItem },
      });

      // Each card sits in a grid-item wrapper, the hook integration tests use.
      expect(screen.getByTestId('grid-item')).toContainElement(
        screen.getByTestId('test-card'),
      );
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

      expect(screen.getByTestId('table-container')).toHaveClass(
        GRID_HOVER_SHADOW_CLASS,
      );
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

      expect(screen.getByTestId('table-container')).toHaveClass(
        TABLE_HOVER_SHADOW_CLASS,
      );
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

      expect(screen.getByTestId('table-container')).not.toHaveClass(
        TABLE_HOVER_SHADOW_CLASS,
      );
    });
  });

  describe('refetching', () => {
    it('marks the rows busy and overlays a spinner while refetching', () => {
      renderWithTableContext(<TableContent />, {
        loading: true,
        hasRows: true,
        rows: [{ uuid: '1' }],
        visibleColumns: [{ title: 'Col', render: () => 'x' }],
      });

      const container = screen.getByTestId('table-container');
      expect(container).toHaveAttribute('aria-busy', 'true');
      // Inert: the stale rows take neither clicks nor keyboard focus.
      expect(container.inert).toBe(true);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('makes the same rows interactive again once loading ends', () => {
      const store = createStore(() => ({}));
      const tree = (loading: boolean) => (
        <Provider store={store}>
          <TableContext.Provider
            value={createMockTableContext({
              loading,
              hasRows: true,
              rows: [{ uuid: '1' }],
              visibleColumns: [{ title: 'Col', render: () => 'x' }],
            })}
          >
            <TableContent />
          </TableContext.Provider>
        </Provider>
      );
      const { rerender } = render(tree(true));
      const container = screen.getByTestId('table-container');
      expect(container.inert).toBe(true);

      rerender(tree(false));

      // Same element, so the flag has to be cleared, not just never set.
      expect(screen.getByTestId('table-container')).toBe(container);
      expect(container.inert).toBe(false);
      expect(container).not.toHaveAttribute('aria-busy');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
