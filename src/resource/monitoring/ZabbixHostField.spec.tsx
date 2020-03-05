import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ZabbixHostCreateButton } from './ZabbixHostCreateButton';
import { ZabbixHostField } from './ZabbixHostField';
import { ZabbixHostStateButton } from './ZabbixHostStateButton';

const renderField = props => {
  const mockStore = configureStore();
  const store = mockStore({ config: { featuresVisible: true } });
  return mount(
    <Provider store={store}>
      <ZabbixHostField resource={{ url: 'url' }} {...props} />
    </Provider>,
  );
};

describe('ResourceMonitoringField', () => {
  it('renders host state if it is available', () => {
    const resource = { zabbix_host: { state: 'OK' } };
    const wrapper = renderField({ resource });
    expect(wrapper.find(ZabbixHostStateButton).length).toBe(1);
  });

  it('renders host create button if it does not exist yet', () => {
    const wrapper = renderField({});
    expect(wrapper.find(ZabbixHostCreateButton).length).toBe(1);
  });
});
