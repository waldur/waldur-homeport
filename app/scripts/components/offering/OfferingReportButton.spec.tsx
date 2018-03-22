import { shallow } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { PureOfferingReportButton } from './OfferingReportButton';

const renderButton = (props?) =>
  shallow(<PureOfferingReportButton translate={translate} {...props}/>);

describe('OfferingReportButton', () => {
  it('conceals button if report is not provided', () => {
    const wrapper = renderButton({offering: {report: ''}});
    expect(wrapper.html()).toBeNull();
  });

  it('renders button if report is provided', () => {
    const wrapper = renderButton({offering: {report: {foo: 'bar'}}});
    expect(wrapper.html()).not.toBeNull();
  });
});
