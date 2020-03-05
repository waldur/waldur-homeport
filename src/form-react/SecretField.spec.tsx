import { mount } from 'enzyme';
import * as React from 'react';

import { SecretField } from './SecretField';

const renderField = () =>
  mount(<SecretField name="password" label="Password" />);

describe('SecretField', () => {
  it('renders password field by default', () => {
    const wrapper = renderField();
    expect(wrapper.find('input').prop('type')).toBe('password');
    expect(wrapper.find('a').prop('className')).toBe('fa password-icon fa-eye');
    expect(wrapper.find('a').prop('title')).toBe('Show');
  });

  it('renders text field when icon is clicked', () => {
    const wrapper = renderField();
    wrapper.find('a').simulate('click');
    expect(wrapper.find('input').prop('type')).toBe('text');
    expect(wrapper.find('a').prop('className')).toBe(
      'fa password-icon fa-eye-slash',
    );
    expect(wrapper.find('a').prop('title')).toBe('Hide');
  });
});
