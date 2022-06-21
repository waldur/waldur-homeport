import { shallow } from 'enzyme';

import { PureIssueReload } from './IssueReload';

describe('IssueReload', () => {
  const renderWrapper = (props?) => shallow(<PureIssueReload {...props} />);

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
