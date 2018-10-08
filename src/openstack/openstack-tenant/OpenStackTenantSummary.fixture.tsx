import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import '@waldur/openstack/provider';

import { OpenStackTenantSummary } from './OpenStackTenantSummary';

export const renderSummary = props => {
  const { tenantCredentialsVisible, ...rest } = props;
  const mockStore = configureStore();
  const store = mockStore({
    config: {
      plugins: {
        WALDUR_OPENSTACK: {
          TENANT_CREDENTIALS_VISIBLE: tenantCredentialsVisible,
        },
      },
    },
  });
  return mount(
    <Provider store={store}>
      <OpenStackTenantSummary {...rest} translate={translate}/>
    </Provider>
  );
};

export const resource = {
  resource_type: 'OpenStack.Tenant',
  state: 'OK',
  runtime_state: 'ONLINE',
  service_settings_state: 'OK',
  extra_configuration: {
    package_name: 'Trial package',
    package_category: 'Small',
  },
  quotas: [
    {
      name: 'vcpu',
      limit: 10.0,
    },
    {
      name: 'ram',
      limit: 10240.0,
    },
    {
      name: 'storage',
      limit: 51200.0,
    },
  ],
  access_url: 'http://example.com/dashboard',
  user_username: 'admin',
  user_password: 'secret',
};

export const getField = (wrapper: ReactWrapper, label: string): ReactWrapper =>
  wrapper.find({label}).find('dd');

export const hasUsername = (wrapper: ReactWrapper): boolean =>
  getField(wrapper, 'Username').length === 1;

export const hasPassword = (wrapper: ReactWrapper): boolean =>
  getField(wrapper, 'Password').length === 1;

export const hasAccess = (wrapper: ReactWrapper): boolean =>
  getField(wrapper, 'Access').length === 1;

export const hasExternalLink = (wrapper: ReactWrapper): boolean =>
  wrapper.find(ExternalLink).length === 1;

export const getPackage = (wrapper: ReactWrapper): string =>
  getField(wrapper, 'Package').text();
