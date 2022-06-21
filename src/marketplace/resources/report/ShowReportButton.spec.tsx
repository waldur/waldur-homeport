import { render } from 'enzyme';
import { FunctionComponent } from 'react';

import { withReduxForm } from '@waldur/form/testUtils';

import { ShowReportButton } from './ShowReportButton';

const renderButton = (props?) => {
  const Component: FunctionComponent = () => <ShowReportButton {...props} />;
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
