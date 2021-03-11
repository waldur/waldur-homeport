import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { actWait, updateWrapper } from '@waldur/core/testUtils';
import { translate } from '@waldur/i18n';
import { SlurmAssociation } from '@waldur/slurm/details/types';
import '@waldur/slurm/provider';

import { SlurmAllocationSummary } from './SlurmAllocationSummary';

export const renderSummary = async (props) => {
  const mockStore = configureStore();
  const store = mockStore();
  const wrapper = mount(
    <Provider store={store}>
      <SlurmAllocationSummary {...props} translate={translate} />
    </Provider>,
  );
  await actWait();
  expect(wrapper.find(LoadingSpinner)).toBeTruthy();
  await updateWrapper(wrapper);
  return wrapper;
};

export const getField = (wrapper: ReactWrapper, label: string): string =>
  wrapper.find({ label }).find('dd').text().trim();

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

export const associations: SlurmAssociation[] = [
  {
    uuid: '736ea9d0111f4c5fbc69cd37b7681283',
    username: 'admin',
    allocation:
      'https://localhost:8001/api/slurm-allocations/cbaeaece8b3f458ab395cca1fcb27a9e/',
  },
];
