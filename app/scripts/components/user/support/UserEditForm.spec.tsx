import { shallow } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';
import {ordinaryUser, staffUser} from '@waldur/user/support/fixtures';
import { TermsOfService } from '@waldur/user/support/TermsOfService';
import { PureUserEditForm } from '@waldur/user/support/UserEditForm';

const renderForm = props => (
  shallow(
    <PureUserEditForm
      translate={translate}
      handleSubmit={jest.fn()}
      showUserRemoval={jest.fn()}
      {...props}
      />
  )
);

describe('UserEditForm', () => {
  it('should render form with all possible fields for STAFF user', () => {
    const wrapper = renderForm({
      initial: false,
      isVisibleForSupportOrStaff: true,
      userTokenIsVisible: true,
      fieldIsVisible: () => true,
      isRequired: () => true,
      nativeNameIsVisible: true,
      showDeleteButton: true,
      user: staffUser,
    });
    expect(wrapper.find({label: 'Full name'}).length).toBe(1);
    expect(wrapper.find({label: 'Native name'}).length).toBe(1);
    expect(wrapper.find({label: 'Email'}).length).toBe(1);
    expect(wrapper.find({label: 'Registration method'}).length).toBe(1);
    expect(wrapper.find({label: 'User status'}).length).toBe(1);
    expect(wrapper.find({label: 'Organization name'}).length).toBe(1);
    expect(wrapper.find({label: 'Job position'}).length).toBe(1);
    expect(wrapper.find({label: 'Description'}).length).toBe(1);
    expect(wrapper.find({label: 'Phone number'}).length).toBe(1);
    expect(wrapper.find({label: 'Current API token'}).length).toBe(1);
    expect(wrapper.find({name: 'token_lifetime'}).length).toBe(1);
    expect(wrapper.find(TermsOfService).length).toBe(1);
    expect(wrapper.find({label: 'Update profile'}).length).toBe(1);
    expect(wrapper.find('#remove-btn').length).toBe(1);
  });

  it('should render form with hidden fields for STAFF user', () => {
    const wrapper = renderForm({
      initial: false,
      isVisibleForSupportOrStaff: false,
      userTokenIsVisible: false,
      fieldIsVisible: () => true,
      isRequired: () => true,
      nativeNameIsVisible: false,
      showDeleteButton: false,
      user: staffUser,
    });
    expect(wrapper.find({label: 'Full name'}).length).toBe(1);
    expect(wrapper.find({label: 'Native name'}).length).toBe(0);
    expect(wrapper.find({label: 'Email'}).length).toBe(1);
    expect(wrapper.find({label: 'Registration method'}).length).toBe(1);
    expect(wrapper.find({label: 'User status'}).length).toBe(0);
    expect(wrapper.find({label: 'Organization name'}).length).toBe(1);
    expect(wrapper.find({label: 'Job position'}).length).toBe(1);
    expect(wrapper.find({label: 'Description'}).length).toBe(0);
    expect(wrapper.find({label: 'Phone number'}).length).toBe(1);
    expect(wrapper.find({label: 'Current API token'}).length).toBe(0);
    expect(wrapper.find({name: 'token_lifetime'}).length).toBe(0);
    expect(wrapper.find(TermsOfService)).toHaveLength(1);
    expect(wrapper.find({label: 'Update profile'}).length).toBe(1);
    expect(wrapper.find('#remove-btn').length).toBe(0);
  });

  it('should render initial form with appropriate fields for STAFF user', () => {
    const wrapper = renderForm({
      initial: true,
      isVisibleForSupportOrStaff: true,
      userTokenIsVisible: false,
      fieldIsVisible: () => false,
      isRequired: () => true,
      nativeNameIsVisible: true,
      showDeleteButton: false,
      user: staffUser,
    });
    expect(wrapper.find({label: 'Full name'}).length).toBe(1);
    expect(wrapper.find({label: 'Native name'}).length).toBe(1);
    expect(wrapper.find({label: 'Email'}).length).toBe(1);
    expect(wrapper.find({label: 'Registration method'}).length).toBe(0);
    expect(wrapper.find({label: 'User status'}).length).toBe(1);
    expect(wrapper.find({label: 'Organization name'}).length).toBe(0);
    expect(wrapper.find({label: 'Job position'}).length).toBe(0);
    expect(wrapper.find({label: 'Description'}).length).toBe(1);
    expect(wrapper.find({label: 'Phone number'}).length).toBe(0);
    expect(wrapper.find({label: 'Current API token'}).length).toBe(0);
    expect(wrapper.find({name: 'token_lifetime'}).length).toBe(0);
    expect(wrapper.find(TermsOfService).length).toBe(1);
    expect(wrapper.find({label: 'Let’s get started'}).length).toBe(1);
    expect(wrapper.find('#remove-btn').length).toBe(0);
  });

  it('should render form with native name and civil number for ORDINARY user', () => {
    const wrapper = renderForm({
      initial: false,
      isVisibleForSupportOrStaff: true,
      userTokenIsVisible: false,
      fieldIsVisible: () => false,
      isRequired: () => false,
      nativeNameIsVisible: true,
      showDeleteButton: false,
      user: ordinaryUser,
    });
    expect(wrapper.find({label: 'Native name'}).length).toBe(1);
    expect(wrapper.find({label: 'ID code'}).length).toBe(1);
  });

});
