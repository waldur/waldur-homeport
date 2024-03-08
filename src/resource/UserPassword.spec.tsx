import { mount, ReactWrapper } from 'enzyme';

import { UserPassword } from './UserPassword';

describe('UserPassword', () => {
  let wrapper: ReactWrapper;

  const getText = () => wrapper.text().trim();
  const getIcon = () => wrapper.find('button').prop('className');

  beforeEach(() => {
    wrapper = mount(<UserPassword password="secret" />);
  });

  it('renders placeholder and open eye icon by default', () => {
    expect(getText()).toBe('***************');
    expect(getIcon()).toBe('text-btn fa fa-eye');
  });

  it('renders password and closed eye icon when user click on toggle icon', () => {
    wrapper.find('button').simulate('click');
    expect(getText()).toBe('secret');
    expect(getIcon()).toBe('text-btn fa fa-eye-slash');
  });
});
