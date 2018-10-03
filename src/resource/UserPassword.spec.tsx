import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { UserPassword } from './UserPassword';

describe('UserPassword', () => {
  let wrapper: ReactWrapper;

  const resource = {user_password: 'secret'};
  const getText = () => wrapper.text().trim();
  const getIcon = () => wrapper.find('a').prop('className');

  beforeEach(() => {
    wrapper = mount(<UserPassword resource={resource} translate={translate}/>);
  });

  it('renders placeholder and open eye icon by default', () => {
    expect(getText()).toBe('***************');
    expect(getIcon()).toBe('fa fa-eye');
  });

  it('renders password and closed eye icon when user click on toggle icon', () => {
    wrapper.find('a').simulate('click');
    expect(getText()).toBe(resource.user_password);
    expect(getIcon()).toBe('fa fa-eye-slash');
  });
});
