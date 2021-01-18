import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { updateWrapper } from '@waldur/core/testUtils';
import * as api from '@waldur/openstack/api';
import { VolumeType } from '@waldur/openstack/types';
import { createActionStore } from '@waldur/resource/actions/testUtils';
import { Volume } from '@waldur/resource/types';

import { RetypeDialog } from './RetypeDialog';

jest.mock('@waldur/openstack/api');

const apiMock = api as jest.Mocked<typeof api>;

const resource = ({
  uuid: 'volume_uuid',
  service_settings_uuid: 'service_settings_uuid',
  type_name: 'Fast SSD',
  type: 'ssd',
} as unknown) as Volume;

const fakeVolumeTypes = ([
  {
    name: 'prod',
    description: 'HPC production HDD',
    url: 'prod',
  },
  {
    name: 'scratch',
    description: 'IOPS intensive SSD',
    url: 'scratch',
  },
  {
    name: 'Fast SSD',
    url: 'ssd',
  },
] as unknown) as VolumeType[];

const mountDialog = () => {
  const store = createActionStore();
  return mount(
    <Provider store={store}>
      <RetypeDialog resolve={{ resource }} />
    </Provider>,
  );
};

describe('RetypeDialog', () => {
  beforeEach(() => {
    apiMock.loadVolumeTypes.mockResolvedValue([]);
  });

  it('renders current volume type label', async () => {
    const wrapper = mountDialog();
    await updateWrapper(wrapper);
    expect(wrapper.text()).toContain('Current type: Fast SSD');
  });

  it('renders placeholder if there are no other volume types available', async () => {
    const wrapper = mountDialog();
    await updateWrapper(wrapper);
    expect(wrapper.text()).toContain(
      'There are no other volume types available.',
    );
  });

  it('renders list of volume types excluding current volume type', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);

    const wrapper = mountDialog();
    await updateWrapper(wrapper);
    expect(
      wrapper.find('select option').map((option) => option.text()),
    ).toEqual(['prod (HPC production HDD)', 'scratch (IOPS intensive SSD)']);
  });

  it('makes API request when form is submitted', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);
    apiMock.retypeVolume.mockResolvedValue(null);
    const wrapper = mountDialog();
    await updateWrapper(wrapper);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', { target: { value: 'prod' } });

    wrapper.find('form').simulate('submit');
    expect(apiMock.retypeVolume).toBeCalledWith(resource.uuid, {
      type: 'prod',
    });
  });
});
