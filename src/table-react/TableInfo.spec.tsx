import { shallow } from 'enzyme';
import * as React from 'react';

import { formatTemplate } from '@waldur/i18n/translate';

import { TableInfo } from './TableInfo';

describe('TableInfo', () => {
  const defaultProps = {
    translate: formatTemplate,
  };

  it('renders message for empty list', () => {
    const wrapper = shallow(<TableInfo {...defaultProps} currentPage={1} pageSize={10} resultCount={0}/>);
    expect(wrapper.contains('Showing 0 to 0 of 0 entries.')).toBe(true);
  });

  it('renders message for pagination', () => {
    const wrapper = shallow(<TableInfo {...defaultProps} currentPage={2} pageSize={10} resultCount={30}/>);
    expect(wrapper.contains('Showing 11 to 20 of 30 entries.')).toBe(true);
  });
});
