import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import { UserPassword } from './UserPassword';

describe('UserPassword', () => {
  let wrapper: ReactWrapper;

  const getText = () => wrapper.text().trim();
  const getIcon = () => wrapper.find('a').prop('className');

  beforeEach(() => {
    wrapper = mount(<UserPassword password="secret"/>);
  });

  it('renders placeholder and open eye icon by default', () => {
    expect(getText()).toBe('***************');
    expect(getIcon()).toBe('fa fa-eye');
  });

  it('renders password and closed eye icon when user click on toggle icon', () => {
    wrapper.find('a').simulate('click');
    expect(getText()).toBe('secret');
    expect(getIcon()).toBe('fa fa-eye-slash');
  });
});
