import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { Tip } from '@waldur/core/Tooltip';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import '@waldur/openstack/provider';

import { ResourceName } from './ResourceName';

jest.mock('@waldur/core/Link', () => {
  return {
    Link: ({ label, children }) => (
      <button className="text-anchor">{label || children}</button>
    ),
  };
});

const resource = {
  name: 'FreeIPA server',
  uuid: 'VALID_UUID',
  resource_type: INSTANCE_TYPE,
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
    const tooltip = wrapper.find(Tip).prop('label');
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
    expect(icon).toContain('Warning');
  });
});
