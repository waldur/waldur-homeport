import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import {
  createMockTableContext,
  renderWithTableContext,
  TableContext,
} from '../../test-utils';

import {
  TableToolbar,
  TableToolbarActions,
  TableToolbarTitle,
} from './TableToolbar';

const store = createStore(() => ({}));

describe('TableToolbar', () => {
  describe('visibility', () => {
    it('renders when hasActionBar is true', () => {
      renderWithTableContext(<TableToolbar />, {
        config: createMockTableContext().config,
      });

      // Card.Header renders as div.card-header
      expect(document.querySelector('.card-header')).toBeInTheDocument();
    });

    it('does not render when hasActionBar is false', () => {
      renderWithTableContext(<TableToolbar />, {
        config: { ...createMockTableContext().config, hasActionBar: false },
      });

      expect(document.querySelector('.card-header')).not.toBeInTheDocument();
    });
  });

  describe('header className', () => {
    it('applies custom headerClassName', () => {
      renderWithTableContext(<TableToolbar />, {
        display: { headerClassName: 'custom-header-class' },
      });

      const header = document.querySelector('.card-header');
      expect(header).toHaveClass('custom-header-class');
    });
  });
});

describe('TableToolbarTitle', () => {
  describe('visibility', () => {
    it('renders when showTitle is true', () => {
      renderWithTableContext(<TableToolbarTitle />, {
        showTitle: true,
      });

      // Should render the column container
      expect(document.querySelector('.order-0')).toBeInTheDocument();
    });

    it('does not render when showTitle is false', () => {
      renderWithTableContext(<TableToolbarTitle />, {
        showTitle: false,
      });

      expect(document.querySelector('.order-0')).not.toBeInTheDocument();
    });
  });

  describe('title content', () => {
    it('renders title from display.title', () => {
      const ctx = createMockTableContext();
      ctx.display.title = 'My Table Title';
      ctx.showTitle = true;
      ctx.config.hideTitle = false;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarTitle />
          </TableContext.Provider>
        </Provider>,
      );

      expect(screen.getByText('My Table Title')).toBeInTheDocument();
    });

    it('renders alterTitle when title is not provided', () => {
      const ctx = createMockTableContext();
      ctx.display.alterTitle = 'Alternate Title';
      ctx.showTitle = true;
      ctx.config.hideTitle = false;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarTitle />
          </TableContext.Provider>
        </Provider>,
      );

      expect(screen.getByText('Alternate Title')).toBeInTheDocument();
    });

    it('renders verboseName in title case', () => {
      const ctx = createMockTableContext();
      ctx.display.verboseName = 'users';
      ctx.showTitle = true;
      ctx.config.hideTitle = false;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarTitle />
          </TableContext.Provider>
        </Provider>,
      );

      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      const ctx = createMockTableContext();
      ctx.display.title = 'Title';
      ctx.display.subtitle = 'This is a subtitle';
      ctx.showTitle = true;
      ctx.config.hideTitle = false;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarTitle />
          </TableContext.Provider>
        </Provider>,
      );

      expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
    });

    it('hides title text when hideTitle is true', () => {
      const ctx = createMockTableContext();
      ctx.display.title = 'My Title';
      ctx.showTitle = true;
      ctx.config.hideTitle = true;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarTitle />
          </TableContext.Provider>
        </Provider>,
      );

      expect(screen.queryByText('My Title')).not.toBeInTheDocument();
    });
  });

  describe('refresh button', () => {
    it('renders refresh button when hideRefresh is false', () => {
      renderWithTableContext(<TableToolbarTitle />, {
        showTitle: true,
        config: { ...createMockTableContext().config, hideRefresh: false },
      });

      // The refresh button is rendered with a loading-spinner data-cy attribute
      expect(
        document.querySelector('[data-cy="loading-spinner"]'),
      ).toBeInTheDocument();
    });

    it('hides refresh button when hideRefresh is true', () => {
      renderWithTableContext(<TableToolbarTitle />, {
        showTitle: true,
        config: { ...createMockTableContext().config, hideRefresh: true },
      });

      // No button should be in the title area
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('custom titleClassName', () => {
    it('applies custom titleClassName to title', () => {
      const ctx = createMockTableContext();
      ctx.display.title = 'My Title';
      ctx.display.titleClassName = 'custom-title-class';
      ctx.showTitle = true;
      ctx.config.hideTitle = false;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarTitle />
          </TableContext.Provider>
        </Provider>,
      );

      const titleElement = screen.getByText('My Title');
      expect(titleElement).toHaveClass('custom-title-class');
    });
  });
});

describe('TableToolbarActions', () => {
  describe('multi-select actions', () => {
    it('renders multi-select actions when rows are selected', () => {
      const MultiSelectActions = ({ rows }) => (
        <button data-testid="multi-select-action">
          Delete {rows.length} items
        </button>
      );

      const ctx = createMockTableContext();
      ctx.selectedRows = [{ uuid: '1' }, { uuid: '2' }];
      ctx.slots.multiSelectActions = MultiSelectActions;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarActions />
          </TableContext.Provider>
        </Provider>,
      );

      expect(screen.getByTestId('multi-select-action')).toBeInTheDocument();
      expect(screen.getByText('Delete 2 items')).toBeInTheDocument();
    });

    it('shows selected count', () => {
      const MultiSelectActions = () => <button>Action</button>;

      const ctx = createMockTableContext();
      ctx.selectedRows = [{ uuid: '1' }, { uuid: '2' }, { uuid: '3' }];
      ctx.slots.multiSelectActions = MultiSelectActions;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarActions />
          </TableContext.Provider>
        </Provider>,
      );

      // The count is rendered as "(3) Selected" split across elements
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/Selected/)).toBeInTheDocument();
    });

    it('calls resetSelection when clicking clear button', async () => {
      const user = userEvent.setup();
      const resetSelection = vi.fn();
      const MultiSelectActions = () => <button>Action</button>;

      const ctx = createMockTableContext();
      ctx.selectedRows = [{ uuid: '1' }];
      ctx.slots.multiSelectActions = MultiSelectActions;
      ctx.actions.resetSelection = resetSelection;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarActions />
          </TableContext.Provider>
        </Provider>,
      );

      const clearButton = screen.getByLabelText('Clear selection');
      await user.click(clearButton);

      expect(resetSelection).toHaveBeenCalled();
    });

    it('does not render multi-select when no rows are selected', () => {
      const MultiSelectActions = () => (
        <button data-testid="multi-action">Action</button>
      );

      const ctx = createMockTableContext();
      ctx.selectedRows = [];
      ctx.slots.multiSelectActions = MultiSelectActions;

      render(
        <Provider store={store}>
          <TableContext.Provider value={ctx}>
            <TableToolbarActions />
          </TableContext.Provider>
        </Provider>,
      );

      expect(screen.queryByTestId('multi-action')).not.toBeInTheDocument();
    });
  });

  describe('search query', () => {
    it('renders search input when hasQuery is true', () => {
      renderWithTableContext(<TableToolbarActions />, {
        config: { ...createMockTableContext().config, hasQuery: true },
        query: '',
      });

      expect(
        screen.getByPlaceholderText(/search/i) || screen.getByRole('searchbox'),
      ).toBeInTheDocument();
    });

    it('does not render search input when hasQuery is false', () => {
      renderWithTableContext(<TableToolbarActions />, {
        config: { ...createMockTableContext().config, hasQuery: false },
      });

      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });
  });

  describe('action buttons visibility', () => {
    it('renders action buttons when showActionsColumn is true', () => {
      renderWithTableContext(<TableToolbarActions />, {
        showActionsColumn: true,
        slots: {
          tableActions: <button data-testid="table-action">Add</button>,
        },
      });

      // The container for actions should be present
      expect(screen.getByTestId('table-action')).toBeInTheDocument();
    });

    it('does not render action buttons container when showActionsColumn is false', () => {
      renderWithTableContext(<TableToolbarActions />, {
        showActionsColumn: false,
        slots: {
          tableActions: <button data-testid="table-action">Add</button>,
        },
      });

      expect(screen.queryByTestId('table-action')).not.toBeInTheDocument();
    });
  });
});
