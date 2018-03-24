import { shallow } from 'enzyme';
import * as React from 'react';

import { TermsOfService } from '@waldur/user/support/TermsOfService';

const renderComponent = (props?) => (
  shallow(
    <TermsOfService
      agreementDate="2018-01-23T10:49:36.162934Z"
      {...props}
      />
  )
);

describe('TermsOfService', () => {
  it('should render default text and agreement date if form is not initial', () => {
    const wrapper = renderComponent();
    expect(wrapper.text()).toContain('have been accepted on');
  });

  it('should render appropriate text if form is initial', () => {
    const wrapper = renderComponent({initial: true});
    expect(wrapper.text()).toContain('By submitting the form you are agreeing to the');
  });
});
