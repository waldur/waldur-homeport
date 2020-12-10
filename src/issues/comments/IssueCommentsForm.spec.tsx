import { shallow } from 'enzyme';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { PureIssueCommentsForm } from './IssueCommentsForm';

describe('IssueCommentsForm', () => {
  const initialProps = {
    translate,
  };
  const renderWrapper = (props?) =>
    shallow(<PureIssueCommentsForm {...initialProps} {...props} />);

  it('handles form submit', () => {
    const handleSubmit = jest.fn();
    const wrapper = renderWrapper({ handleSubmit });
    wrapper.find(SubmitButton).simulate('click');
    expect(handleSubmit).toBeCalled();
  });
});
