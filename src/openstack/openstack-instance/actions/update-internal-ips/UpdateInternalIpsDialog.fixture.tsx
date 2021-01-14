import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { actWait, updateWrapper } from '@waldur/core/testUtils';
import {
  OpenStackInstance,
  Subnet,
} from '@waldur/openstack/openstack-instance/types';

import { UpdateInternalIpsDialog } from './UpdateInternalIpsDialog';

export const fakeSubnet = ({
  url: '/api/openstacktenant-subnets/51e584157094493ca121f71642c0a409/',
  name: 'p60347-sub-net',
  cidr: '192.168.42.0/24',
} as unknown) as Subnet;

export const fakeInstance = ({
  name: 'backup',
  uuid: 'bcbb973635754084a5b292ecb2274e33',
  service_settings_uuid: 'a500a20d8f7040eabb9e0103d5f119af',
  floating_ips: [],
  internal_ips_set: [
    {
      subnet: fakeSubnet.url,
      subnet_name: fakeSubnet.name,
      subnet_cidr: fakeSubnet.cidr,
    },
  ],
} as unknown) as OpenStackInstance;

type DialogWrapperType = ReactWrapper<typeof UpdateInternalIpsDialog>;

export class DialogFixture {
  store: Store;
  instance: OpenStackInstance;
  wrapper: DialogWrapperType;

  constructor(store: Store, instance: OpenStackInstance = fakeInstance) {
    this.store = store;
    this.instance = instance;
  }

  async render() {
    this.wrapper = mount<typeof UpdateInternalIpsDialog>(
      <Provider store={this.store}>
        <UpdateInternalIpsDialog resolve={{ resource: this.instance }} />
      </Provider>,
    );
    await actWait();
  }

  async update() {
    await updateWrapper(this.wrapper);
  }

  submitForm() {
    this.wrapper.find('form').simulate('submit');
  }
}
