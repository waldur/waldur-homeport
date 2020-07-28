import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import { SubmitButton } from './SubmitButton';

const renderButton = (options = {}) =>
  mount(
    <SubmitButton
      submitting={false}
      disabled={false}
      label="Create project"
      {...options}
    />,
  );

const isDisabled = (wrapper: ReactWrapper) =>
  wrapper.find('button').prop('disabled');
const hasSpinner = (wrapper: ReactWrapper) =>
  wrapper.find('.fa-spinner').length === 1;

describe('SubmitButton', () => {
  it('renders enabled button without spinner', () => {
    const wrapper = renderButton();
    expect(wrapper.text()).toBe('Create project');
    expect(isDisabled(wrapper)).toBe(false);
    expect(hasSpinner(wrapper)).toBe(false);
  });

  it('renders disabled button without spinner', () => {
    const wrapper = renderButton({ disabled: true });
    expect(isDisabled(wrapper)).toBe(true);
    expect(hasSpinner(wrapper)).toBe(false);
  });

  it('renders spinner and blocks button', () => {
    const wrapper = renderButton({ submitting: true });
    expect(isDisabled(wrapper)).toBe(true);
    expect(hasSpinner(wrapper)).toBe(true);
  });
});
