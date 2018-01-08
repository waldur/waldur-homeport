import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { translate } from '@waldur/i18n';
import '@waldur/slurm/provider';

import { SlurmAllocationSummary } from './SlurmAllocationSummary';

export const renderSummary = props => {
  const mockStore = configureStore();
  const store = mockStore();
  return mount(
    <Provider store={store}>
      <SlurmAllocationSummary {...props} translate={translate}/>
    </Provider>
  );
};

export const getField = (wrapper: ReactWrapper, label: string): string =>
  wrapper.find({label}).find('dd').text();

export const resource = {
  resource_type: 'SLURM.Allocation',
  state: 'OK',
  runtime_state: 'ONLINE',
  service_settings_state: 'OK',
  username: 'admin',
  gateway: 'example.com',
  backend_id: 'VALID_ID',
  cpu_usage: 120,
  cpu_limit: 2400,
  gpu_usage: 0,
  gpu_limit: -1,
  ram_usage: 10240,
  ram_limit: 20480,
};
