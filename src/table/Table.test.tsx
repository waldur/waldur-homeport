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
});
