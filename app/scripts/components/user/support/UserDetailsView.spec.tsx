import { shallow } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { PureUserDetailsView } from './UserDetailsView';

const staffUser = {
  is_support: false,
  is_staff: true,
};

const supportUser = {
  is_support: true,
  is_staff: false,
};

const ordinaryUser = {
  is_support: false,
  is_staff: false,
};

const renderUserDetailsView = props => (
  shallow(<PureUserDetailsView {...props} translate={translate} userDetailsIsVisible={true} userManageIsVisible={true}/>)
);

describe('UserDetailsView', () => {
  it('should conceal "Manage" tab for support user', () => {
    const wrapper = renderUserDetailsView({currentUser: supportUser});
    expect(wrapper.find({title: 'Manage'}).length).toBe(0);
  });

  it('should conceal "Manage" tab for ordinary user', () => {
    const wrapper = renderUserDetailsView({currentUser: ordinaryUser});
    expect(wrapper.find({title: 'Manage'}).length).toBe(0);
  });

  it('should conceal "Details" tab for ordinary user', () => {
    const wrapper = renderUserDetailsView({currentUser: ordinaryUser});
    expect(wrapper.find({title: 'Details'}).length).toBe(0);
  });

  it('should display "Manage" tab for staff user', () => {
    const wrapper = renderUserDetailsView({currentUser: staffUser});
    expect(wrapper.find({title: 'Manage'}).length).toBe(1);
  });
});
