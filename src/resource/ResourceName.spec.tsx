import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { Tooltip } from '@waldur/core/Tooltip';
import '@waldur/openstack/provider';

import { ResourceName } from './ResourceName';

jest.mock('@waldur/core/Link', () => {
  return {
    Link: ({ label, children }) => <a>{label || children}</a>,
  };
});

const resource = {
  name: 'FreeIPA server',
  uuid: 'VALID_UUID',
  resource_type: 'OpenStackTenant.Instance',
  is_link_valid: true,
};

const renderLink = (extraProps?) => {
  const mockStore = configureStore();
  const store = mockStore();
  const component = (
    <Provider store={store}>
      <ResourceName resource={{ ...resource, ...extraProps }} />
    </Provider>
  );
  return mount(component);
};

describe('ResourceName', () => {
  it('renders a name', () => {
    const wrapper = renderLink();
    const label = wrapper.text().trim();
    expect(label).toBe(resource.name);
  });

  it('renders a tooltip', () => {
    const wrapper = renderLink();
    const tooltip = wrapper.find(Tooltip).prop('label');
    expect(tooltip).toBe('OpenStack Instance');
  });

  it('renders an icon', () => {
    const wrapper = renderLink();
    const img = wrapper.find('img').prop('src');
    expect(img).toBe('images/appstore/icon-openstack.png');
  });

  it('renders a warning', () => {
    const wrapper = renderLink({ is_link_valid: false });
    const icon = wrapper.find('i').prop('className');
    expect(icon).toContain('fa-exclamation-triangle');
  });
});
