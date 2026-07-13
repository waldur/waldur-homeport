import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import Table from './Table';

const TableWrapper = (component) => {
  const store = createStore(() => ({}));

  return <Provider store={store}>{component}</Provider>;
};

describe('Table', () => {
  const fetch = vi.fn();
  const props = {
    loading: false,
    error: null,
    fetch,
    resetSelection: vi.fn(),
    setFilterPosition: vi.fn(),
    initColumnPositions: vi.fn(),
    rows: [],
    sorting: {
      mode: undefined,
      field: null,
      loading: false,
    },
    activeColumns: {},
    columnPositions: [],
  };

  describe('special states', () => {
    it('renders message if list is empty', () => {
      render(TableWrapper(<Table {...props} />));
      expect(screen.getByText('There are no items yet.')).toBeInTheDocument();
    });

    it('renders custom message if list is empty and verboseName is set', () => {
      render(TableWrapper(<Table {...props} verboseName="projects" />));
      expect(screen.getByText('No projects found')).toBeInTheDocument();
    });

    it('renders custom message if list is empty and verboseName is set and query is set', () => {
      render(
        TableWrapper(
          <Table {...props} verboseName="projects" query="my projects" />,
        ),
      );
      expect(
        screen.getByText(
          'Your search "my projects" did not match any projects.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    const renderComponent = () =>
      render(
        TableWrapper(
          <Table
            fetch={fetch}
            resetSelection={vi.fn()}
            setFilterPosition={vi.fn()}
            initColumnPositions={vi.fn()}
            loading={false}
            error={null}
            pagination={{
              resultCount: 1,
              currentPage: 1,
              pageSize: 10,
            }}
            columns={[
              {
                title: 'Resource type',
                render: ({ row }) => row.type,
              },
              {
                title: 'Resource name',
                render: ({ row }) => row.name,
              },
            ]}
            rows={[
              {
                type: 'OpenStack Instance',
                name: 'Web server',
              },
            ]}
            activeColumns={{}}
            columnPositions={[]}
          />,
        ),
      );

    it('renders column headers', () => {
      renderComponent();
      expect(screen.getByText('Resource type')).toBeInTheDocument();
      expect(screen.getByText('Resource name')).toBeInTheDocument();
    });

    it('renders row values', () => {
      renderComponent();
      expect(screen.getByText('OpenStack Instance')).toBeInTheDocument();
      expect(screen.getByText('Web server')).toBeInTheDocument();
    });
  });

  describe('falsy column guard', () => {
    // Feature-gated columns are declared inline as `condition && { ... }`,
    // which yields a falsy entry when the condition is off. Such entries must
    // be dropped from both header and body, otherwise the header renders an
    // extra <th> the body has no <td> for and every later column shifts.
    const renderWithColumns = (columns) =>
      render(
        TableWrapper(
          <Table
            fetch={fetch}
            resetSelection={vi.fn()}
            setFilterPosition={vi.fn()}
            initColumnPositions={vi.fn()}
            loading={false}
            error={null}
            pagination={{ resultCount: 1, currentPage: 1, pageSize: 10 }}
            columns={columns}
            rows={[{ type: 'OpenStack Instance', state: 'OK' }]}
            activeColumns={{}}
            columnPositions={[]}
          />,
        ),
      );

    it('drops a falsy column so header and body stay aligned', () => {
      renderWithColumns([
        { title: 'Type', render: ({ row }) => row.type },
        // feature flag off
        false,
        { title: 'State', render: ({ row }) => row.state },
      ]);

      // The falsy entry must not produce a third header.
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('State')).toBeInTheDocument();

      // Header count must match body cell count (no shift).
      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(headers.length);
      expect(cells[0]).toHaveTextContent('OpenStack Instance');
      expect(cells[1]).toHaveTextContent('OK');
    });

    it('drops null and undefined column entries too', () => {
      renderWithColumns([
        { title: 'Type', render: ({ row }) => row.type },
        null,
        undefined,
        { title: 'State', render: ({ row }) => row.state },
      ]);

      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
      expect(screen.getAllByRole('cell')).toHaveLength(2);
    });
  });
});
