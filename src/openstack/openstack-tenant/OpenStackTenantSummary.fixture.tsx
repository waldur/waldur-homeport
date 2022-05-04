import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import '@waldur/openstack/provider';

import { OpenStackTenantSummary } from './OpenStackTenantSummary';

export const renderSummary = (props) => {
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
      <OpenStackTenantSummary {...rest} translate={translate} />
    </Provider>,
  );
};

export const resource = {
  resource_type: 'OpenStack.Tenant',
  state: 'OK',
  runtime_state: 'ONLINE',
  service_settings_state: 'OK',
  marketplace_offering_name: 'Trial package',
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

export const getField = (
  wrapper: ReactWrapper,
  children: string,
): ReactWrapper => {
  const match = wrapper.find({ children });
  if (match.length === 0) {
    return null;
  }
  return match.at(0).closest('div').find('div').at(2);
};

export const hasUsername = (wrapper: ReactWrapper): boolean =>
  !!getField(wrapper, 'Username');

export const hasPassword = (wrapper: ReactWrapper): boolean =>
  !!getField(wrapper, 'Password');

export const hasAccess = (wrapper: ReactWrapper): boolean =>
  !!getField(wrapper, 'Access');

export const hasExternalLink = (wrapper: ReactWrapper): boolean =>
  !!wrapper.find(ExternalLink);

export const getSummary = (wrapper: ReactWrapper): string =>
  getField(wrapper, 'Summary').text();
