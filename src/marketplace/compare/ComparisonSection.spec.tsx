import { shallow } from 'enzyme';
import * as React from 'react';

import { SystemSection, Offerings } from '../common/AttributeCell.fixtures';
import { ComparisonSection } from './ComparisonSection';

describe('ComparisonSection', () => {
  it('renders comparison section', () => {
    const wrapper = shallow(<ComparisonSection section={SystemSection} items={Offerings} />);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
