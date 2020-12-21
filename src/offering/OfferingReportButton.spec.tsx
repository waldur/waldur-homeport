import { render } from 'enzyme';
import { FunctionComponent } from 'react';

import { withReduxForm } from '@waldur/form/testUtils';
import { translate } from '@waldur/i18n';

import { OfferingReportButton } from './OfferingReportButton';

const renderButton = (props?) => {
  const Component: FunctionComponent = () => (
    <OfferingReportButton translate={translate} {...props} />
  );
  return render(withReduxForm(Component));
};

describe('OfferingReportButton', () => {
  it('conceals button if report is not provided', () => {
    const wrapper = renderButton({ offering: { report: '' } });
    expect(wrapper.html()).toBeNull();
  });

  it('renders button if report is provided', () => {
    const wrapper = renderButton({ offering: { report: { foo: 'bar' } } });
    expect(wrapper.html()).not.toBeNull();
  });
});
