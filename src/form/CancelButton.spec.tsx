import { ShallowWrapper, ReactWrapper, mount } from 'enzyme';
import { Button } from 'react-bootstrap';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { CancelButton } from './CancelButton';

const mockStore = configureStore();
const store = mockStore();

export const renderCancelButton = (props) => {
  return mount(
    <Provider store={store}>
      <CancelButton disabled={false} label="Cancel" {...props} />
    </Provider>,
  );
};

const isDisabled = (wrapper) => wrapper.find(Button).prop('disabled');

const clickButton = (wrapper) => wrapper.find(Button).simulate('click');

describe('CancelButton', () => {
  it('renders enabled button', () => {
    const wrapper: ShallowWrapper | ReactWrapper = renderCancelButton({});
    expect(wrapper.text()).toBe('Cancel');
    expect(isDisabled(wrapper)).toBe(false);
  });

  it('renders disabled button', () => {
    const wrapper: ShallowWrapper | ReactWrapper = renderCancelButton({
      disabled: true,
    });
    expect(isDisabled(wrapper)).toBe(true);
  });

  it('handle click on button', () => {
    const onClick = jest.fn();
    const wrapper: ShallowWrapper | ReactWrapper = renderCancelButton({
      onClick,
    });
    clickButton(wrapper);
    expect(onClick).toBeCalled();
  });
});
