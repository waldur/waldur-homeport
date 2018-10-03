import { shallow } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { PureIssueReload } from './IssueReload';

describe('IssueReload', () => {
  const initialProps = {
    translate,
  };
  const renderWrapper = (props?) => shallow(<PureIssueReload {...initialProps} {...props} />);

  it('spinning if prop loading is true', () => {
    const wrapper = renderWrapper({ loading: true });
    expect(wrapper.find('.fa-spin').length).toBe(1);
  });

  it('fetch issue data on click', () => {
    const fetchData = jest.fn();
    const wrapper = renderWrapper({ fetchData });
    wrapper.find('.issue-reload').simulate('click');
    expect(fetchData).toBeCalled();
  });
});
