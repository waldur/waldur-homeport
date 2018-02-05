import { shallow } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { PureUserDetailsView, UserDetailsViewProps } from './UserDetailsView';

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

const renderUserDetailsView = (props: UserDetailsViewProps) => (
  shallow(
    <PureUserDetailsView {...props} />
  )
);

describe('UserDetailsView', () => {
  it('should conceal "Manage" tab for support user', () => {
    const wrapper = renderUserDetailsView({currentUser: supportUser, translate});
    const manageTab = wrapper.findWhere(n => n.prop('title') === 'Manage');
    expect(manageTab).toHaveLength(0);
  });

  it('should conceal "Manage" tab for ordinary user', () => {
    const wrapper = renderUserDetailsView({currentUser: ordinaryUser, translate});
    const manageTab = wrapper.findWhere(n => n.prop('title') === 'Manage');
    expect(manageTab).toHaveLength(0);
  });

  it('should conceal "User Details" tab for ordinary user', () => {
    const wrapper = renderUserDetailsView({currentUser: ordinaryUser, translate});
    const manageTab = wrapper.findWhere(n => n.prop('title') === 'User Details');
    expect(manageTab).toHaveLength(0);
  });

  it('should display "Manage" tab for staff user', () => {
    const wrapper = renderUserDetailsView({currentUser: staffUser, translate});
    const manageTab = wrapper.findWhere(n => n.prop('title') === 'Manage');
    expect(manageTab).toHaveLength(1);
  });
});
