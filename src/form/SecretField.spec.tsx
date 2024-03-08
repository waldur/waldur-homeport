import { mount } from 'enzyme';

import { SecretField } from './SecretField';

const renderField = () =>
  mount(<SecretField name="password" label="Password" />);

describe('SecretField', () => {
  it('renders password field by default', () => {
    const wrapper = renderField();
    expect(wrapper.find('input').prop('type')).toBe('password');
    expect(wrapper.find('button').prop('className')).toBe(
      'text-btn fa password-icon fa-eye',
    );
    expect(wrapper.find('button').prop('title')).toBe('Show');
  });

  it('renders text field when icon is clicked', () => {
    const wrapper = renderField();
    wrapper.find('button').simulate('click');
    expect(wrapper.find('input').prop('type')).toBe('text');
    expect(wrapper.find('button').prop('className')).toBe(
      'text-btn fa password-icon fa-eye-slash',
    );
    expect(wrapper.find('button').prop('title')).toBe('Hide');
  });
});
