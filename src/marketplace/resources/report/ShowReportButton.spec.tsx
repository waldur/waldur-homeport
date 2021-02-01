import { render } from 'enzyme';
import { FunctionComponent } from 'react';

import { withReduxForm } from '@waldur/form/testUtils';
import { translate } from '@waldur/i18n';

import { ShowReportButton } from './ShowReportButton';

const renderButton = (props?) => {
  const Component: FunctionComponent = () => (
    <ShowReportButton translate={translate} {...props} />
  );
  return render(withReduxForm(Component));
};

describe('ShowReportButton', () => {
  it('conceals button if report is not provided', () => {
    const wrapper = renderButton({ report: '' });
    expect(wrapper.html()).toBeNull();
  });

  it('renders button if report is provided', () => {
    const wrapper = renderButton({ report: { foo: 'bar' } });
    expect(wrapper.html()).not.toBeNull();
  });
});
