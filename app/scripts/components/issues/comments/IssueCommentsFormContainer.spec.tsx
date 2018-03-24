import { shallow } from 'enzyme';
import * as React from 'react';

import { PureIssueCommentsFormContainer } from './IssueCommentsFormContainer';

const initialProps = {
  formId: 'id',
};
const renderWrapper = (props?) => shallow(<PureIssueCommentsFormContainer {...initialProps} {...props} />);

describe('IssueCommentsFormMainContainer', () => {
  it('renders null if not opened', () => {
    const wrapper = renderWrapper();
    expect(wrapper.html()).toBe(null);
  });
});
