import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { CancelButton } from './CancelButton';

const renderButton = (options = {}) =>
  shallow(<CancelButton disabled={false} label="Cancel" {...options} />);

const isDisabled = (wrapper: ShallowWrapper) => wrapper.find('button').prop('disabled');
const clickButton = (wrapper: ShallowWrapper) => wrapper.find('button').simulate('click');

describe('CancelButton', () => {
  it('renders enabled button', () => {
    const wrapper = renderButton();
    expect(wrapper.text()).toBe('Cancel');
    expect(isDisabled(wrapper)).toBe(false);
  });

  it('renders disabled button', () => {
    const wrapper = renderButton({ disabled: true });
    expect(isDisabled(wrapper)).toBe(true);
  });

  it('handle click on button', () => {
    const onClick = jest.fn();
    const wrapper = renderButton({ onClick });
    clickButton(wrapper);
    expect(onClick).toBeCalled();
  });
});
