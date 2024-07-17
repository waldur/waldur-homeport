import { mount, shallow } from 'enzyme';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { TableLoadingSpinnerContainer } from '@waldur/table/TableLoadingSpinnerContainer';

import Table from './Table';

describe('Table', () => {
  const fetch = jest.fn();
  const props = {
    loading: false,
    error: null,
    fetch,
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
    it('renders spinner if list is loading', () => {
      const wrapper = shallow(
        <TableLoadingSpinnerContainer {...props} loading={true} />,
      );
      expect(wrapper.contains(<LoadingSpinnerIcon />)).toBe(true);
    });

    it('renders message if loading failed', () => {
      const wrapper = shallow(<Table {...props} error="Not found" />);
      expect(wrapper.html()).toContain('Unable to fetch data.');
    });

    it('renders message if list is empty', () => {
      const wrapper = mount(<Table {...props} />);
      expect(wrapper.contains('There are no items yet.')).toBe(true);
    });

    it('renders custom message if list is empty and verboseName is set', () => {
      const wrapper = mount(<Table {...props} verboseName="projects" />);
      expect(wrapper.contains('There are no projects yet.')).toBe(true);
    });

    it('renders custom message if list is empty and verboseName is set and query is set', () => {
      const wrapper = mount(
        <Table {...props} verboseName="projects" query="my projects" />,
      );
      expect(
        wrapper.contains('There are no projects found matching the filter.'),
      ).toBe(true);
    });
  });

  describe('data rendering', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Table
          fetch={fetch}
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
      );
    });

    it('renders column headers', () => {
      expect(wrapper.contains(<th>Resource type</th>)).toBe(true);
      expect(wrapper.contains(<th>Resource name</th>)).toBe(true);
    });

    it('renders row values', () => {
      expect(wrapper.contains('OpenStack Instance')).toBe(true);
      expect(wrapper.contains('Web server')).toBe(true);
    });
  });
});
