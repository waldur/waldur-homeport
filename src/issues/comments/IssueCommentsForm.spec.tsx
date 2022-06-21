import { shallow } from 'enzyme';

import { SubmitButton } from '@waldur/form';

import { IssueCommentsForm } from './IssueCommentsForm';

describe('IssueCommentsForm', () => {
  const renderWrapper = (props?) => shallow(<IssueCommentsForm {...props} />);

  it('handles form submit', () => {
    const handleSubmit = jest.fn();
    const wrapper = renderWrapper({ handleSubmit });
    wrapper.find(SubmitButton).simulate('click');
    expect(handleSubmit).toBeCalled();
  });
});
