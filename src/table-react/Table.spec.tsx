import { shallow, mount } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatTemplate } from '@waldur/i18n/translate';

import Table from './Table';

describe('Table', () => {
  const fetch = jasmine.createSpy('fetch');
  const defaultProps = {
    translate: formatTemplate,
    loading: false,
    error: null,
    fetch,
    rows: [],
    sorting: {
      mode: undefined,
      field: null,
      loading: false,
    },
  };

  describe('special states', () => {
    it('renders spinner if list is loading', () => {
      const wrapper = shallow(<Table {...defaultProps} loading={true} />);
      expect(wrapper.contains(<LoadingSpinner />)).toBe(true);
    });

    it('renders message if loading failed', () => {
      const wrapper = shallow(<Table {...defaultProps} error="Not found" />);
      expect(wrapper.contains('Unable to fetch data.')).toBe(true);
    });

    it('renders message if list is empty', () => {
      const wrapper = mount(<Table {...defaultProps} />);
      expect(wrapper.contains('There are no items yet.')).toBe(true);
    });

    it('renders custom message if list is empty and verboseName is set', () => {
      const wrapper = mount(<Table {...defaultProps} verboseName="projects" />);
      expect(wrapper.contains('There are no projects yet.')).toBe(true);
    });

    it('renders custom message if list is empty and verboseName is set and query is set', () => {
      const wrapper = mount(
        <Table {...defaultProps} verboseName="projects" query="my projects" />,
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
          translate={formatTemplate}
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
